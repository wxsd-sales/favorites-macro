/********************************************************
 * 
 * Macro Author:      	William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-0
 * Released: 27/04/22
 * 
 * This Webex Device macro automatically adds local phonebook
 * favorites to your device based by looking up Devices on 
 * your Webex Org which have been approperately tagged on 
 * Control Hub. 
 * 
 * The Devices list is obtained via this Webex API request:
 * https://developer.webex.com/docs/api/v1/devices/list-devices
 * 
 * Therefore, a Service App Integration is required with a 
 * 'spark-admin:devices_read' access scope. Refer to this guide
 * to setup a Service App on your Webex App and add the OAuth
 * details to the macros config below: 
 * https://developer.webex.com/docs/service-app
 * 
 * Full Readme, source code and license details available on Github:
 * https://github.com/wxsd-sales/favorites-macro
 * 
 ********************************************************/
import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  oauth: {
    clientId: '<Webex Service App Client ID>',
    clientSecret: '<Webex Service App Client Secret>',
    refreshToken: '<Webex Service App Client Refresh Token>'
  },
  favTags: [      // Specify the device tags you have set on control hub
    'phonebook-contact',    // Each tag will be used as the folder name
    'testing'               // Each device with that tag will be placed in that folder as a contact
  ],
  refreshPeriod: 3600  // How frequently you want the macro to check for updates in seconds - 3600 = 1 hour
}


/*********************************************************
 * Main functions and event subscriptions
**********************************************************/

let oauth = {
  accessToken: null,
  expiresDate: null
};

async function main() {
  xapi.Config.HttpClient.Mode.set('On');

  if (config.favTags.length < 1) {
    console.log('No favorite tags provided - stopping macro')
    return
  }

  // Retrieve any stored token
  const storedoauth = await xapi.Config.FacilityService.Service[5].Number.get();
  if (storedoauth != '') {
    try{
      oauth = JSON.parse(atob(storedoauth));
      console.log('OAuth Token Restored')
    } catch {
      console.log('Error parsing stored OAuth Token')
    }
  }

  updateFavorites(config.favTags);
  setInterval(updateFavorites, config.refreshPeriod * 1000, config.favTags);
}

// Start the main function after a short delay to ensure Runtime is fully started
setTimeout(main, 1000);

async function updateFavorites(favTags) {

  console.log(`Updating favorites - number for tags [${favTags.length}]`)

  if (oauth.accessToken == null) {
    console.log('No Access Token - Generating')
    await getAccessToken();
  }

  const hour = 60 * 60 * 1000;
  const date = new Date(Date.now().valueOf() + hour);

  if (oauth.expiresDate <= date.valueOf()) {
    console.log('Access Token Expired - Generating new one')
    await getAccessToken();
  } else {
    console.log('Access Token Valid');
  }

  let favs = {}
  for (let i = 0; i < favTags.length; i++) {
    favs[favTags[i]] = await getDeviceList(oauth.accessToken, favTags[i]);
  }
  await deleteAllFolders();
  addFavorites(favs);
}

// Adds all favorites into approperate folders
function addFavorites(favs) {
  console.log('Adding folders and favorites to device local phonebook')
  Object.keys(favs).forEach((folder, folderfavs) => {
    if (favs[folder].length < 1) {
      console.log(`No favorites for [${folder}], this folder will not be added`);
      return;
    }
    console.log('Creating Folder: ' + folder);
    xapi.Command.Phonebook.Folder.Add({ Name: folder })
      .then(r => {
        console.log(`Adding [${favs[folder].length}] favorites to folder [${folder}]`);
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
      if (r.ResultInfo.TotalRows == 0) { return }
      r.Folder.forEach(f => xapi.Command.Phonebook.Folder.Delete({ FolderId: f.FolderId }))
    })
}


// Gets list of devices with a specific tag
function getDeviceList(token, tag) {
  console.log(`Getting device list with tag [${tag}]`)
  return xapi.Command.HttpClient.Get({
    Header: ["Authorization: Bearer " + token],
    ResultBody: 'PlainText',
    Url: 'https://webexapis.com/v1/devices?tag=' + tag
  })
    .then(result => {
      const body = JSON.parse(result.Body);
      const items = body.items;
      console.log(`Tag [${tag}] returned ${items.length} devices`);
      if (items.length < 1) { return [] }
      return isolateData(items);
    })
    .catch(err => {
      console.log(err)

      if (err.hasOwnProperty('StatusCode')) {
        console.log(`Error getting device list for tag [${tag}] - StatusCode [${err.data.StatusCode}] - Message [${err.message}]`);
        if (err.data.StatusCode == '401') {
          console.log('Access Token may be expired, attempting to refresh')
          // TODO: Recover from expired token
        }
      } else {
        console.log(`Error getting device list for tag [${tag}] - Message [${err.message}]`);
      }

    })
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


function getAccessToken() {
  const body = {
    "grant_type": "refresh_token",
    "client_id": config.oauth.clientId,
    "client_secret": config.oauth.clientSecret,
    "refresh_token": config.oauth.refreshToken
  }

  return xapi.Command.HttpClient.Post({
    Header: ['Content-Type: application/json'],
    ResultBody: 'PlainText',
    Url: 'https://webexapis.com/v1/access_token'
  },
    JSON.stringify(body)
  )
    .then(result => {
      const body = JSON.parse(result.Body);
      oauth.accessToken = body.access_token;
      oauth.expiresDate = new Date(Date.now().valueOf() + (body.expires_in * 1000)).valueOf();

      console.log(JSON.stringify(oauth));
      xapi.Config.FacilityService.Service[5].Number.set(btoa(JSON.stringify(oauth)))
      .then(result => console.log('New Access Token Stored'))
      .catch(err => conole.log('Error storing new Access Token: ' + err))

      console.log(`New Access Token Obtained - expires in [${body.expires_in}] seconds at [${oauth.expiresDate}]`);
      return
    })
    .catch(err => {
      if (err.hasOwnProperty('StatusCode')) {
        console.log(`Error getting access token - StatusCode [${err.data.StatusCode}] - Message [${err.message}]`)
      } else {
        console.log(`Error getting access token - Message [${err.message}]`)
      }
    })
}
