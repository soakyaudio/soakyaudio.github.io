---
title: "AUv3 & SwiftUI: Embed Audio Unit Extensions in a Multiplatform App"
date: 2023-01-03
---
SwiftUI makes it easy to build multiplatform apps using a single codebase. However, the current Xcode templates for application extensions only support one target platform, meaning that you have to create separate extensions for each platform when developing a multiplatform app. This can result in unnecessary duplication of code, especially when bundling [audio unit extensions](https://developer.apple.com/documentation/avfaudio/audio_engine/audio_units/creating_an_audio_unit_extension), since AUv3 supports both macOS and iOS.

Let us start by creating a new multiplatform project in Xcode:

![Create multiplatform app project in Xcode](/img/2023-01-03-multiplatform-audiounit/00-create-project.png)
*Create a new Xcode project, then select __Multiplatform__, __App__ and click __Next__.*

![Set project metadata](/img/2023-01-03-multiplatform-audiounit/01-create-project.png)
*Fill the metadata, click __Next__, then select a path and hit __Create__.*

Try to run your newly created project on macOS and iOS to verify your build is working. Then proceed with adding an app extension by selecting the root project and pressing the small __+__ icon at the bottom of the left __Targets__ sidebar:

![Select root project and press plus icon in targets sidebar](/img/2023-01-03-multiplatform-audiounit/02-add-extension.png)
*Select root project and press __+__ icon in the __Targets__ sidebar.*

![Choose macOS audio unit extension template](/img/2023-01-03-multiplatform-audiounit/03-add-extension.png)
*Choose __macOS__, __Audio Unit Extension__ and press __Next__.*

> While it is also possible to start from an iOS extension template, it takes slightly more effort to fix up the UI part on macOS targets (aka copying the missing files from the macOS template). That obviously only matters if your audio unit comes with its own user interface.

In the next dialog, you will need to set the metadata for the audio unit. Xcode will generate a different template based on the audio unit type and whether a UI should be included. It is best to examine the [various options](https://developer.apple.com/documentation/avfaudio/audio_engine/audio_units/creating_an_audio_unit_extension) and select the most suitable one, as adjusting the templates later and understanding the internals of AUv3 can be quite time-consuming.

![Set audio unit metadata](/img/2023-01-03-multiplatform-audiounit/04-add-extension.png)
*Fill the metadata, in particular __Audio Unit Type__ and __User Interface__, then click __Finish__.*

After Xcode generated the template code, let us see the macOS audio unit in action. Activate the scheme of the extension (__FancyInstrument__), set the target platform (__My Mac__) and click __Run__. You will be asked for a host app to run the audio unit - any app that supports AUv3 plugins will do, e.g. Logic Pro X, GarageBand or AU Lab (bundled with [Additional Tools for Xcode](https://developer.apple.com/download/all/?q=Additional%20Tools%20for%20Xcode)).

![Select app to run the macOS audio unit](/img/2023-01-03-multiplatform-audiounit/05-run-macos.png)
*Select the extension scheme, the target platform and click __Run__. Then choose an app to run the unit and confirm with __Run__.*

You should be able to use your audio unit like any other plugin. While the host application is running, you can also validate the unit via the `auval` tool.

![Opened audio unit in Logic Pro X](/img/2023-01-03-multiplatform-audiounit/06-run-macos.png)
*Logic Pro X lists instrument audio units (remember the Audio Unit Type) under __AU Instruments__, whereas effects are found in __Audio FX__ -> __Audio Units__.*

![Use auval to validate the audio unit](/img/2023-01-03-multiplatform-audiounit/07-run-macos.png)
*Use `auval` to validate the audio unit.*

Close the host application and head back to Xcode. If you try to run the same scheme on an iOS target, you will be greeted by a *"run destination not valid"* error message. Let us fix that in the build settings:

![Navigate to the audio unit build settings](/img/2023-01-03-multiplatform-audiounit/08-build-settings.png)
*Select root project and extension target, then __Build Settings__ and verify __All__ is selected.*

![Add iOS to supported platforms](/img/2023-01-03-multiplatform-audiounit/09-build-settings.png)
*Under __Architectures__ -> __Supported Platforms__, choose __Other...__ and add the __iphonesimulator__ and __iphoneos__ platform strings.*

![Set base SDK to automatic](/img/2023-01-03-multiplatform-audiounit/10-build-settings.png)
*Under __Architectures__ -> __Base SDK__, choose __Other...__ and enter __auto__.*

Since the macOS view controller `xib` file does not support iOS targets, you have to exclude it from the __Copy Bundle Resources__ build step:

![Exclude xib file from copy bundle resources build step](/img/2023-01-03-multiplatform-audiounit/11-build-settings.png)
*Under __Build Phases__ -> __Copy Bundle Resources__, locate the view controller `xib` file, select __Filters__ and activate __macOS__ only.*

> Side note: If you examined the audio unit extension template for iOS, you would see that it includes a storyboard in place of the `xib` file. In my testing, the storyboard was not necessary to get the UI working on iOS - in fact, no matter what I changed, the changes were not reflected in the final audio unit. I might get something wrong here, so please do not hesitate to [reach out](mailto:hello@soakyaudio.com) if you have better insight into this.

Completing these steps lets you build the extension for iOS, but the install step fails due to a provisioning profile error. This is caused by sandbox settings that are necessary on macOS but do not apply to iOS. Luckily, Xcode allows conditional settings based on the SDK which can reconcile both worlds:

![Conditional sandbox settings for macOS and iOS](/img/2023-01-03-multiplatform-audiounit/12-build-settings.png)
*Back under __Build Settings__, search for the __Signing__ section. Add conditional settings by pressing the small __+__ icon.*

The __Enable App Sandbox__ setting should be __No__ by default and __Yes__ for __Any macOS SDK__. The __Enable User Selected Files__ setting should be __None__ by default and __Read-Only__ for __Any macOS SDK__. Getting these settings wrong will cause your audio unit not showing up on macOS.

Try to run the extension scheme on an iOS target now. To use AUv3 plugins on your iOS device, you will need a compatible host application, such as GarageBand:

![Select app to run the iOS audio unit](/img/2023-01-03-multiplatform-audiounit/13-run-ios.png)
*Select the extension scheme, an iOS target and click __Run__. Then choose an app to run the unit and confirm with __Run__.*

![Create external audio unit extension track in GarageBand](/img/2023-01-03-multiplatform-audiounit/14-run-ios.png)
*In GarageBand, add a new external track, selecting __Audio Unit Extensions__.*

> If you cannot see the audio unit in the host app, try running the app scheme (__FancyAudioApp__) first to install the main app. Then switch back to the extension scheme, run it and proceed from there.

![Audio unit user interface in GarageBand](/img/2023-01-03-multiplatform-audiounit/15-run-ios.png)
*To open the user interface, tap the controls button on the top.*

If everything works up to this point, do a sanity check on macOS by switching back to a macOS target platform and rerunning the extension scheme. Your audio unit should still show up in the host app and the user interface should be working too.

That is it, you have successfully created a multiplatform app with an audio unit extension, all using a single codebase. I uploaded the final project to [GitHub](https://github.com/soakyaudio/multiplatform-audiounit) as a reference.

If you have any additional questions or would like to provide feedback, please contact me via [email](mailto:hello@soakyaudio.com). You can also find discussion about this post on the relevant [Hacker News thread](https://news.ycombinator.com/item?id=34266028). If you enjoy my content and would like to support me, feel free to purchase one of [my apps](https://apps.apple.com/developer/micha-hanselmann/id1544237803).
