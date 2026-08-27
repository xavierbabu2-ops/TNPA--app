# Android APK Generation & Download Guide for TNPA²

இந்த செயலி (TNPA² - Tamil Nadu Painters & Artists Association) ஆண்ட்ராய்டு APK ஃபைலாக மாற்ற இரண்டு எளிய வழிகள் உள்ளன:

### முறை 1: GitHub Actions மூலம் ஆட்டோமேட்டிக் APK டவுன்லோட் (சிறந்தது)
1. உங்கள் கோப்புகளை GitHub களஞ்சியத்திற்கு (Repository) **Push** செய்யவும்.
2. உங்கள் GitHub ரிபாசிட்டரியில் உள்ள **Actions** டேபிற்குச் செல்லவும்.
3. அங்கு **"Build Android APK (TWA / Bubblewrap)"** ஒர்க்புளோ ஓடிக்கொண்டிருப்பதைக் காணலாம்.
4. பில்ட் முடிந்ததும் (Build Successful), கீழே உள்ள **Artifacts** பகுதியில் **`TNPA-Android-APK`** ஃபைல் இருக்கும்.
5. அதை கிளிக் செய்து ஜிப் (ZIP) ஃபைலாகப் பதிவிறக்கம் செய்து கொள்ளலாம். அதற்குள் ஆண்ட்ராய்டு APK இருக்கும்!

### முறை 2: PWABuilder மூலம் நேரடி APK உருவாக்கம்
1. [PWABuilder.com](https://www.pwabuilder.com/) இணையதளத்திற்குச் செல்லவும்.
2. உங்கள் வெப்சைட் லைவ் முகவரியை (GitHub Pages URL அல்லது Vercel URL) உள்ளிட்டு **"Start"** அழுத்தவும்.
3. **"Generate"** கிளிக் செய்து **Android** தொகுப்பைத் தேர்ந்தெடுத்து உடனடியாக APK டவுன்லோட் செய்யவும்.

