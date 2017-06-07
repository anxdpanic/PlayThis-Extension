![PlayThis](https://raw.githubusercontent.com/anxdpanic/PlayThis-Extension/firefox/images/icon_128.png)
# PlayThis (Firefox)

Adds PlayThis context menu item to pages, frames, links, videos, audio, images and selections.

- 'Send' urls to PlayThis add-on in Kodi for resolving/playback
- 'Add' urls for resolving/playback at a later time
- 'Send as text to Kodi' to send urls/text to Kodi input
- Supports up to 4 remote Kodi profiles

Uses Kodi JSON-RPC over web sockets to remotely execute the PlayThis add-on with url/src.

The PlayThis add-on will attempt to find and resolve<sup>1</sup> media from a url to play or open. A history list is available for future use/exporting to M3U<sup>2</sup>. Supports video, audio, images and executable<sup>3</sup>.
* <sup>1</sup> resolves using URLResolver and youtube-dl
* <sup>2</sup> M3U only usable in Kodi w/ PlayThis installed
* <sup>3</sup> 'executable' items are urls with potential results available through scraping


- Requirements
    -

    - Firefox 53.0a2+
    - [PlayThis 3+ add-on for Kodi](https://github.com/anxdpanic/plugin.video.playthis#playthis)
    - Kodi setting: `Settings -> Services -> Remote Control -> Allow remote control by programs on other systems`

- Installation
    -

    Install from [AMO Gallery](https://addons.mozilla.org/en-US/firefox/addon/playthis/)

- Support
    -

    Post an [Issue](https://github.com/anxdpanic/PlayThis-Extension/issues) , or visit [#the_projects on Snoonet](https://kiwiirc.com/client/irc.snoonet.org/The_Projects)

---

Special thanks to [@konsumer420](https://twitter.com/konsumer420) for the icons/artwork
