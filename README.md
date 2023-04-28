# Favorites Macro

This Webex Device macro automatically adds favorites contacts to your device by querying Webex Devices on your Webex Org which have been tagged on Webex Control Hub.

![ezgif com-gif-maker (2)](https://user-images.githubusercontent.com/21026209/205152597-9fe570ca-d0ec-4153-b20e-73bf62eb65bf.gif)

## Overview

The macro uses an Webex Integration Access Token to make REST API calls to the Webex list devices API. It queries based on tags which can be configured on Webex Control Hub and then adds only the devices with these tags to the devices local phonebook as favorites. The macro queries the list devices API periodically in order to keep the favorites up to date. Therefore, by updating the tags on Control Hub, you can determine which devices are been automatically added to any device favorites running the macro.

## Setup

### Prerequisites & Dependencies: 

This macro has two versions which have different dependencies:

#### Webex Bot Integration

- For the Webex Bot version of this macro you will need a Webex Bot Access Token which has been given Read Device API access to the devices you wany to query
  - More information available here: https://developer.webex.com/docs/devices#giving-a-bot-or-user-access-to-the-xapi-of-a-device

#### Webex Service App Integration

- For the Service App version you will need a Service App which has been given the ``spark-admin:devices_read`` access scope on your Webex Org
- Once created, you will need a copy of the Service Apps Client Id, Client Secret and Refresh Token for the macros configuration
  - More information available here: https://developer.webex.com/docs/service-app

#### Common Dependencies

- RoomOS/CE 9.6.x or above Webex Device
- Web admin access to the device to upload the macro.
- Network connectivity so your Webex Device can make REST API calls to: ``webexapis.com``

### Installation Steps:

1. Download the ``favorites-macro-bot.js`` or ``favorites-macro-oauth.js`` file and upload it to your Webex Room devices Macro editor via the web interface.
2. Configure the macro by changing the initial values, there are comments explaining each one.
    - For the ``favorites-macro-bot.js`` (Webex Bot) macro, add your Webex Bots Access Token to the ``botToken``` section in the configuration.
    - For the ``favorites-macro-oauth.js`` (Webex Service App) macro, add your Webex Service Apps Client Id, Client Secret and Refresh Token to the oauth section of the macros configuration
3. Save the macro changes and enable it using the toggle in the Macro on the editor.


## Validation

Validated Hardware:

* Room Kit Pro
* Desk Pro
* Room Kit
* Desk Hub

This macro should work on other Webex Devices but has not been validated at this time.

## Demo

*For more demos & PoCs like this, check out our [Webex Labs site](https://collabtoolbox.cisco.com/webex-labs).

## License

All contents are licensed under the MIT license. Please see [license](LICENSE) for details.

## Disclaimer

Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex use cases, but are not Official Cisco Webex Branded demos.

## Questions

Please contact the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=favorites-macro) for questions. Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to make sure you reach our team. 
