# Favorites Macro

This Webex Device macro automatically creates favourites for meeting room devices in your Webex Org based off Control Hub Tags

## How it works

The macro uses a Webex Bot token to search for any Webex Devices which have tagged in your Webex Org. You can configured multiple tags in the macros configuration and any device found with that matching tag will have its contact info added to a local phonebook folder with the same name of the tag. That way you could create create a tag call 'sales' and tag all the devices in your Webex Org with it and have a folder called sales with all the sales devices.

![ezgif com-gif-maker (2)](https://user-images.githubusercontent.com/21026209/205152597-9fe570ca-d0ec-4153-b20e-73bf62eb65bf.gif)

## Requirements

1. RoomOS/CE 9.6.x or above
2. Webex Bot Access Token for your org with API read API access for your favorite devices.
3. Web admin access to the device to uplaod the macro.
4. Network connectivity for your Webex Device to query for new favorites via Webex APIs

## Setup

1. Download the ``favorites-macro.js`` file and upload it to your Webex Room devices Macro editor via the web interface.
2. Configure the Macro by changing the initial values, there are comments explaining each one.
3. Enable the Macro on the editor.


## Validation

Validated Hardware:

* Room Kit Pro
* Desk Pro
* Room Kit

This macro should work on other Webex Devices but has not been validated at this time.

## Support

Please reach out to the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=favorites-macro).
