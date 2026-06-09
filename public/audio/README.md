# ZenFlow Audio Assets

The app self-hosts a small set of ambient audio files so playback works on GitHub Pages without CDN/CORS surprises. Audio is lazy-loaded only after the user starts sound.

## Sources

Most files come from Mixkit sound effects/music, used under Mixkit's free license:
https://mixkit.co/license/

- `rain.mp3` - Mixkit, "Light rain loop" - https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3
- `forest.mp3` - Mixkit, "Morning birds" - https://assets.mixkit.co/active_storage/sfx/2472/2472-preview.mp3
- `stream.mp3` - Mixkit, "Water flowing ambience loop" - https://assets.mixkit.co/active_storage/sfx/3126/3126-preview.mp3
- `ocean.mp3` - Mixkit, "Sea waves with birds loop" - https://assets.mixkit.co/active_storage/sfx/1185/1185-preview.mp3
- `cafe.mp3` - Mixkit, "Restaurant crowd talking ambience" - https://assets.mixkit.co/active_storage/sfx/444/444-preview.mp3
- `fireplace.mp3` - Mixkit, "Campfire crackles" - https://assets.mixkit.co/active_storage/sfx/1330/1330-preview.mp3
- `typewriter.mp3` - Mixkit, "Old typewriter typing" - https://assets.mixkit.co/active_storage/sfx/1372/1372-preview.mp3
- `temple_bell.mp3` - Mixkit, "Church bell calling" - https://assets.mixkit.co/active_storage/sfx/603/603-preview.mp3
- `lofi.mp3` - Mixkit Music, "Relax Beat" - https://assets.mixkit.co/music/292/292.mp3

`wind_chime.ogg` comes from Wikimedia Commons:
https://commons.wikimedia.org/wiki/File:Sound_of_Wind_chime_in_slight_breeze_include_daily_life_noises.ogg

If a browser cannot play one file format, ZenFlow falls back to a very soft synthesized voice for that track.
