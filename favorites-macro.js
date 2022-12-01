/********************************************************
Copyright (c) 2022 Cisco and/or its affiliates.
This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at
               https://developer.cisco.com/docs/licenses
All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*********************************************************
 * 
 * Macro Author:      	William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-0
 * Released: 12/01/22
 * 
 * This Webex Device macro automatically creates favourites for meeting 
 * room devices in your Webex Org based off Control Hub Tags
 * 
 * Full Readme and source code availabel on Github:
 * https://github.com/wxsd-sales/favorites-macro
 * 
 ********************************************************/
import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  botToken: '<Your Webex Bot Access Token>',
  favTags: [      // Specify the device tags you have set on control hub
    'phonebook-contact',    // Each tag will be used as the folder name
    'testing'               // Each device with that tag will be placed in that folder as a contact
  ],
  refreshPeriod: 3600000  // How frequently you want the macro to check for updates in milliseconds, 3600000 milliseconds = 1 hour
}


/*********************************************************
 * Configure the settings below
**********************************************************/

function main() {
  applyConfiguration();
  setInterval(updateFavorites(config.favTags), config.refreshPeriod);
}

// Start the main function after a short delay to ensure Runtime is fully started
setTimeout(main, 1000);

async function updateFavorites(favTags) {
  if (favTags.length < 1) {
    console.log('No Favorite Tags provided')
    return
  }
  let favs = {}
  for (let i = 0; i < favTags.length; i++) {
    favs[favTags[i]] = await getDeviceList(favTags[i]);
  }
  await deleteAllFolders();
  await addFavorites(favs);
}

// Adds all favorites into approperate folders
function addFavorites(favs) {
  console.log('Adding Favorites to device')
  console.log(favs)
  Object.keys(favs).forEach((folder, folderfavs) => {
    if(favs[folder].length < 1){
      console.log(`No favorites for folder: ${folder}`);
      return;
    }
    console.log('Creating Folder: ' + folder);
    xapi.Command.Phonebook.Folder.Add({ Name: folder })
      .then(r => {
        console.log(r)
        console.log('Folder Created for: ' + folder);
        favs[folder].forEach(fav => {
          xapi.Command.Phonebook.Contact.Add({
            Device: 'Video',
            FolderId: r.Name,
            Name: fav.Name,
            Number: fav.ContactId,
            Protocol: "Spark",
            Tag: 'Favorite'
          });
        })
      })
  })
}


// Deletes all local phonebook folders
function deleteAllFolders() {
  console.log('Deleting All Folders')
  return xapi.Command.Phonebook.Search({ ContactType: 'Folder' })
    .then(r => {
      if(r.ResultInfo.TotalRows == 0) {return}
      r.Folder.forEach(f => xapi.Command.Phonebook.Folder.Delete({ FolderId: f.FolderId }))
    })
}


// Gets list of devices with a specific tag
function getDeviceList(tag) {
  console.log('Getting device list with tag: ' + tag)
  return xapi.Command.HttpClient.Get({
    Header: ["Authorization: Bearer " + config.botToken],
    ResultBody: 'PlainText',
    Url: 'https://webexapis.com/v1/devices?tag=' + tag
  })
    .then((r) => {
      const results = JSON.parse(r.Body).items;
      console.log(results);
      console.log(`Tag: ${tag} returned ${results.length} devices`);
      if(results.length < 1 ) {return []}
      return isolateData(results);
    })
    .catch(e => console.log('Unable to get device list: ', e))

}

// Gets just the contact name and Id from the device list
function isolateData(devices) {
  return Array.from(devices, (d) => {
    var id = atob(d.workspaceId).split('/').pop();
    return {
      Name: d.displayName,
      ContactId: id
    }
  })
}

function applyConfiguration() {
  console.log('Apply Configurations');
  xapi.Config.HttpClient.Mode.set('On');
}
