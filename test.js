const { emails } = require("./email");
const puppeteer = require("puppeteer");
const { Bot } = require("grammy");
require("dotenv").config();

const bot = new Bot(`${process.env.TELEGRAM_BOT_TOKEN}`);
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const CHATID = process.env.TELEGRAM_BOT_CHAT_ID;

async function start() {
  let date = new Date().toLocaleTimeString();

  console.log("start time = " + " " + date);
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ["--no-sandbox"],
    });
    //comment

    for (let i = 0; i < emails.length; i++) {
      const page = await browser.newPage();

      await page.setDefaultNavigationTimeout(0);

      await page.goto("https://ais.usvisa-info.com/en-et/niv/users/sign_in");

      await page.waitForSelector(".string.email.required");
      await page.type(".string.email.required", emails[i].username);
      await page.type("#user_password", emails[i].password);
      await page.waitForSelector(
        "#sign_in_form > div.radio-checkbox-group.margin-top-30 > label > div"
      );
      await page.click(
        "#sign_in_form > div.radio-checkbox-group.margin-top-30 > label > div"
      );
      await page.click(".simple_form.new_user p input");

      await page.waitForSelector(".medium-6.columns.text-right ul li a");
      await page.click(
        "#main > div:nth-child(2) > div.mainContent > div:nth-child(1) > div > div > div:nth-child(1) > div.medium-6.columns.text-right > ul > li > a"
      );

      await page.waitForSelector(".fas.fa-money-bill-alt");

      await page.waitForSelector(
        "#forms > ul > li:nth-child(1) > div > div > div.medium-10.columns > p:nth-child(2) > a"
      );
      await page.evaluate(() =>
        document
          .querySelector(
            "#forms > ul > li:nth-child(1) > div > div > div.medium-10.columns > p:nth-child(2) > a"
          )
          .click()
      );

      await page.waitForSelector(
        "#paymentOptions > div.medium-3.column > table > tbody > tr > td.text-right"
      );
      const slotDate = await page.$eval(
        "#paymentOptions > div.medium-3.column > table > tbody > tr > td.text-right",
        (el) => el.textContent
      );

      let slot = slotDate + "Hurry up and book";
      let date = new Date().toLocaleTimeString();
      console.log(slot + date);
      await delay(53000);

      const regex = new RegExp("September");

      if (regex.test(slotDate)) {
        await bot.api.sendMessage(CHATID, slot);
      }

      await page.close();
    }

    await browser.close();
    console.log("Scraping completed");
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }
}

start();

// import 'dart:async';

// import 'package:bloc/bloc.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:cloud_functions/cloud_functions.dart';
// import 'package:connectivity_plus/connectivity_plus.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:flutter/material.dart';
// import 'package:freezed_annotation/freezed_annotation.dart';
// import 'package:geocoding/geocoding.dart';
// import 'package:geolocator/geolocator.dart';
// import 'package:injectable/injectable.dart';
// import 'package:just_audio/just_audio.dart';
// import 'package:just_audio_background/just_audio_background.dart';
// import 'package:rxdart/rxdart.dart';
// import 'package:teraki_mobile/data/advert/models/advert_engagement.dart';
// import 'package:teraki_mobile/data/advert/models/advert_model.dart';
// import 'package:teraki_mobile/data/advert/repositories/advert.repository.dart';
// import 'package:teraki_mobile/data/audiobook/models/audiobook_model.dart';
// import 'package:teraki_mobile/data/core/sqflite/models/audio_sources.dart';
// import 'package:teraki_mobile/data/core/sqflite/models/parent.dart';
// import 'package:teraki_mobile/data/core/sqflite/models/paused_audio.dart';
// import 'package:teraki_mobile/data/core/utils/cache.util.dart';
// import 'package:teraki_mobile/data/core/utils/enum.util.dart';
// import 'package:teraki_mobile/data/core/utils/local_storage.util.dart';
// import 'package:teraki_mobile/data/payment/models/telebirr_confirmation_model.dart';
// import 'package:teraki_mobile/data/payment/repositories/payment.repository.dart';
// import 'package:teraki_mobile/data/podcast/models/favorite_podcast_model.dart';
// import 'package:teraki_mobile/injection/injection.dart';
// import 'package:teraki_mobile/presentation/core/blocs/continueListening/continue_listening_bloc.dart';
// import 'package:teraki_mobile/presentation/core/type/player_position_data.dart';
// import 'package:teraki_mobile/presentation/core/type/player_status.enum.dart';
// import 'package:teraki_mobile/presentation/core/type/progress_status.enum.dart';
// import 'package:teraki_mobile/presentation/core/utils/notification.util.dart';
// import 'package:teraki_mobile/presentation/core/utils/ui_util.dart';
// import 'package:teraki_mobile/presentation/screens/settings/type/payment_instriction.dart';

// part 'wide_bloc.freezed.dart';
// part 'wide_event.dart';
// part 'wide_state.dart';

// @injectable
// class WideBloc extends Bloc<WideEvent, WideState> {
//   StreamSubscription<ConnectivityResult>? sub;
//   StreamSubscription<PlayerPositionData>? playerSub;
//   StreamSubscription<PlayerState>? playerStateSub;
//   final AdvertRepository advertRepository;
//   final CacheUtil cacheUtil;
//   final PaymentRepository paymentRepository;
//   bool _isTransitioningFromAd = false;

//   WideBloc(
//       {required this.advertRepository,
//       required this.cacheUtil,
//       required this.paymentRepository})
//       : super(WideState()) {
//     on<ToggleTheme>(
//       (event, emit) async {
//         await localStorage.write('theme', enumToString(event.mode));
//         emit(state.copyWith(themeMode: event.mode));
//       },
//     );
//     on<LanguageChanged>(
//       (event, emit) async {
//         emit(state.copyWith(languageChanged: !state.languageChanged));
//       },
//     );
//     on<RootCheckAlerted>(
//       (event, emit) async {
//         emit(state.copyWith(isAlerted: true));
//       },
//     );
//     on<ConfirmApplePayment>(_confirmApplePayment);
//     on<FetchPaymentInstructions>(_onFetchPaymentInstructions);

//     on<InitAudioPlayer>(
//       (event, emit) async {
//         if (event.audioPlayer != null) {
//           final positionData = Rx.combineLatest4<PlayerState, Duration,
//               Duration, Duration?, PlayerPositionData>(
//             event.audioPlayer!.playerStateStream,
//             event.audioPlayer!.positionStream,
//             event.audioPlayer!.bufferedPositionStream,
//             event.audioPlayer!.durationStream,
//             (
//               state,
//               position,
//               bufferPosition,
//               duration,
//             ) =>
//                 PlayerPositionData(
//               position,
//               bufferPosition,
//               duration ?? Duration.zero,
//               state,
//             ),
//           ).asBroadcastStream();
//           emit(state.copyWith(
//             audioPlayer: event.audioPlayer,
//             positionDataStream: positionData,
//           ));
//         } else {
//           if (state.audioPlayer != null) {
//             state.audioPlayer!.dispose();
//           }
//           emit(state.copyWith(audioPlayer: null));
//         }
//       },
//     );
//     on<InitPlaylist>(
//       (event, emit) async {
//         emit(state.copyWith(playlist: event.playlist));
//       },
//     );
//     on<ControlPlayer>(
//       (event, emit) async {
//         emit(state.copyWith(playerStatus: event.status));
//       },
//     );
//     on<ChangePlayingAudiobook>(
//       (event, emit) async {
//         emit(state.copyWith(playingAudiobookId: event.audiobook));
//       },
//     );
//     on<SetDownloadedAudioSource>(
//       (event, emit) async {
//         emit(
//           state.copyWith(
//             downloadedAudioSource: event.downloadedAudioSource,
//           ),
//         );
//       },
//     );
//     on<SubscribeToFollowingPodcast>(
//       (event, emit) async {
//         if (localStorage.read('subscribed') == null) {
//           User? user = FirebaseAuth.instance.currentUser;
//           if (user != null) {
//             final token = await firebaseMessaging.getToken();
//             HttpsCallable subscribeFollowingPodcasts = FirebaseFunctions
//                 .instance
//                 .httpsCallable('subscribeFollowingPodcasts');
//             final res = await subscribeFollowingPodcasts(
//               {
//                 'token': token,
//                 'uid': user.uid,
//               },
//             );

//             localStorage.write('subscribed', res.data['message'] == 'success');
//           }
//         }
//       },
//     );
//     on<SubscribeToGeneralNotification>(
//       (event, emit) async {
//         try {
//           if (localStorage.read('generalNotificationSubscribed') == null) {
//             await firebaseMessaging.subscribeToTopic('notifications');
//             if (isAndroid()) {
//               await firebaseMessaging.subscribeToTopic('notifications-android');
//             }
//             if (!isAndroid()) {
//               await firebaseMessaging.subscribeToTopic('notifications-ios');
//             }

//             localStorage.write('generalNotificationSubscribed', true);
//           }
//         } on Exception catch (e) {
//           debugPrint('$e');
//         }
//       },
//     );

//     Future<Placemark> getPlaceMark(Position position) async {
//       List<Placemark> placemarks = await placemarkFromCoordinates(
//         position.latitude,
//         position.longitude,
//       );
//       return placemarks.first;
//     }

// // Helper function to get user's current position
//     Future<Position> _determinePosition() async {
//       bool serviceEnabled;
//       LocationPermission permission;

//       // Test if location services are enabled.
//       serviceEnabled = await Geolocator.isLocationServiceEnabled();
//       if (!serviceEnabled) {
//         throw Exception("Location services are disabled");
//       }

//       permission = await Geolocator.checkPermission();
//       if (permission == LocationPermission.denied) {
//         permission = await Geolocator.requestPermission();
//         if (permission == LocationPermission.denied) {
//           throw Exception("Location permission denied");
//         }
//       }

//       if (permission == LocationPermission.deniedForever) {
//         throw Exception("Location permission denied forever");
//       }

//       // Return the current position
//       return await Geolocator.getCurrentPosition();
//     }

//     on<GetUserLocation>((event, emit) async {
//       try {
//         // Step 1: Get the current position
//         final position = await _determinePosition();

//         // Step 2: Get the ISO country code using placemarkFromCoordinates
//         final placemark = await getPlaceMark(position);
//         print("locate");
//         print(placemark);
//         final countryCode =
//             placemark.isoCountryCode?.toLowerCase() ?? 'unknown';
//         print(countryCode);

//         // Step 3: Emit the new state with the determined country code
//         emit(state.copyWith(countryCode: countryCode));
//       } catch (e) {
//         print("Error fetching location: $e");
//         emit(state.copyWith(
//             countryCode: 'unknown')); // Fallback in case of error
//       }
//     });

// // Helper function to get placemark and extract country code

//     on<RefreshPaymentConfirmation>((event, emit) async {
//       try {
//         print("blocation");
//         emit(state.copyWith());
//       } catch (e) {
//         debugPrint('Error during payment confirmation refresh: $e');
//       }
//     });

//     on<RegisterFCMToken>(
//       (event, emit) async {
//         try {
//           final firebaseUser = FirebaseAuth.instance.currentUser;
//           if (firebaseUser != null) {
//             final uid = firebaseUser.uid;
//             String? fcmToken = await firebaseMessaging.getToken();

//             if (fcmToken != null) {
//               // Fetch the user document from Firestore
//               final userDoc = await FirebaseFirestore.instance
//                   .collection('users')
//                   .doc(uid)
//                   .get();

//               if (userDoc.exists) {
//                 await FirebaseFirestore.instance
//                     .collection('users')
//                     .doc(uid)
//                     .update({'fcmToken': fcmToken});
//                 // Save the FCM token in localStorage
//               } else {
//                 print("Cannot find user!");
//               }
//             } else {}
//           }
//         } on Exception catch (e) {
//           debugPrint('Error registering FCM token: $e');
//         }
//       },
//     );

//     on<SetPlayingMediaData>(
//       (event, emit) async {
//         emit(state.copyWith(
//           parent: event.parent,
//           downloadedAudioSource: event.downloadedAudioSource,
//           activeAudiobook: event.activeAudiobook,
//           isAudiobook: event.isAudiobook,
//           isPaid: event.isPaid,
//         ));
//       },
//     );
//     on<SetPlaybackSpeed>(
//       (event, emit) async {
//         emit(state.copyWith(
//           playbackSpeed: event.value,
//         ));
//       },
//     );
//     on<SetPodcastFav>(
//       (event, emit) async {
//         emit(state.copyWith(
//           favoritePodcast: event.favoritePodcast,
//           favoriteAdded: event.added,
//         ));
//       },
//     );
//     on<Reset>(
//       (event, emit) async {
//         emit(state.copyWith(
//           parent: null,
//           downloadedAudioSource: null,
//           isAudiobook: null,
//           isPaid: null,
//           favoriteAdded: null,
//           favoritePodcast: null,
//           activeAudiobook: null,
//           playingAudiobookId: null,
//         ));
//       },
//     );
//     on<ConnectionNotify>(
//       (event, emit) async {
//         emit(
//           state.copyWith(
//             connectionResult: event.result,
//           ),
//         );
//       },
//     );
//     on<ObserveConnection>(
//       (event, emit) async {
//         sub = Connectivity()
//             .onConnectivityChanged
//             .listen((ConnectivityResult result) {
//           add(ConnectionNotify(result));
//         });
//       },
//     );
//     on<ListenPlayerStream>(
//       (event, emit) async {
//         // Listening playing audio stream to get duration and position data
//         playerSub = state.positionDataStream?.listen((positionData) async {
//           _handleAd(positionData, state);
//         });
//       },
//     );
//     on<TrigAdvert>(
//       (event, emit) async {
//         final media = state.audioPlayer?.audioSource
//             ?.sequence[state.audioPlayer!.currentIndex!].tag as MediaItem;
//         final isAd = media.extras?['ad'];
//         emit(
//           state.copyWith(
//             advertTrigTime: (event.resetAdvertTrigTime ?? false)
//                 ? null
//                 : event.time ?? state.advertTrigTime,
//             trigAdvert: event.trig,
//             continueDuration:
//                 isAd ? state.continueDuration : event.currentDuration,
//             continueIndex: isAd ? state.continueIndex : event.currentIndex,
//             isAd: event.trig,
//             isLastAd: event.isLastAd ?? false,
//           ),
//         );
//         if (event.trig &&
//             !isAd &&
//             (state.adverts[media.id]?.isNotEmpty ?? false)) {
//           print("adverts");
//           final ad = state.adverts[media.id]!.first;
//           emit(
//             state.copyWith(
//               adverts: {
//                 ...state.adverts,
//                 media.id: [...state.adverts[media.id]!..removeAt(0), ad]
//               },
//               activeAdvert: ad,
//             ),
//           );
//           final playlist = ConcatenatingAudioSource(
//             children: [ad.audioSource],
//           );
//           await state.audioPlayer?.setAudioSource(
//             playlist,
//             initialIndex: 0,
//           );
//           await state.audioPlayer?.play();
//           add(
//             SetAdvertEngagement(
//               AdvertEngagementModel(
//                 id: media.id,
//                 advertId: ad.id,
//                 parentId: media.extras?['parentId'],
//                 mediaType: state.isAudiobook ?? false
//                     ? MediaType.audiobook
//                     : MediaType.podcast,
//                 engagementType: EngagementType.impression,
//               ),
//             ),
//           );
//         }
//       },
//     );
//     on<SetPlayingPlaylist>(
//       (event, emit) {
//         emit(state.copyWith(
//           playingPlaylist: event.playingPlaylist,
//         ));
//       },
//     );
//     on<GetAdvert>(
//       (event, emit) async {
//         emit(
//           state.copyWith(
//             adverts: {
//               ...state.adverts,
//               event.id: [],
//             },
//           ),
//         );
//         final advertOrFailure = await advertRepository.getAdverts(event.id);
//         advertOrFailure.fold(
//           (l) => null,
//           (r) => emit(
//             state.copyWith(
//               adverts: {
//                 ...state.adverts,
//                 event.id: r,
//               },
//             ),
//           ),
//         );
//       },
//     );

//     on<SetContinueDuration>(
//       (event, emit) {
//         emit(state.copyWith(continueDuration: event.duration));
//       },
//     );
//     on<SetDuration>(
//       (event, emit) {
//         emit(state.copyWith(duration: event.duration));
//       },
//     );
//     on<CacheAudio>(
//       (event, emit) async {
//         final cacheOrFailure = await cacheUtil.storeCache(event.url);
//         cacheOrFailure.fold(
//           (l) => null,
//           (r) => emit(
//             state.copyWith(
//               cached: {
//                 ...state.cached,
//                 event.id: true,
//               },
//             ),
//           ),
//         );
//       },
//     );
//     on<SetAdvertEngagement>(
//       (event, emit) async {
//         if (event.data.engagementType == EngagementType.click) {
//           emit(state.copyWith(advertEngageStatus: ProgressStatus.loading));
//         }
//         final res = await advertRepository.setAdvertEngagement(event.data);
//         res.fold((l) {
//           if (event.data.engagementType == EngagementType.click) {
//             emit(state.copyWith(advertEngageStatus: ProgressStatus.failure));
//           }
//         }, (r) {
//           if (event.data.engagementType == EngagementType.click) {
//             emit(state.copyWith(advertEngageStatus: ProgressStatus.success));
//           }
//         });
//       },
//     );
//     on<ResetAdvertEngageStatus>(
//       (event, emit) async {
//         emit(state.copyWith(advertEngageStatus: ProgressStatus.pure));
//       },
//     );
//     on<GetGiftedUser>(
//       (event, emit) async {
//         emit(state.copyWith(giftedUser: event.result));
//       },
//     );
//     on<ResetGiftedUser>((event, emit) {
//       emit(state.copyWith(
//         giftedUser: null,
//       ));
//     });
//   }

//   _confirmApplePayment(
//     ConfirmApplePayment event,
//     Emitter<WideState> emit,
//   ) async {
//     emit(
//       state.copyWith(
//         confirmApplePayStatus: ProgressStatus.loading,
//       ),
//     );

//     final response = await paymentRepository.confirmTelebirrPayment(
//       event.confirmationModel,
//     );

//     response.fold(
//       (error) => emit(
//         state.copyWith(
//           confirmApplePayStatus: ProgressStatus.failure,
//           errorMessage: error,
//         ),
//       ),
//       (isPaid) {
//         emit(
//           state.copyWith(
//             confirmApplePayStatus: ProgressStatus.success,
//             isPaid: isPaid,
//           ),
//         );
//       },
//     );
//   }

//   Future<void> _onFetchPaymentInstructions(
//     FetchPaymentInstructions event,
//     Emitter<WideState> emit,
//   ) async {
//     // Set loading to true
//     emit(state.copyWith(paymentInstructionsLoading: true));
//     print("started");
//     try {
//       // Fetch payment instructions from Firestore
//       final snapshot = await FirebaseFirestore.instance
//           .collection('payment_instructions')
//           .where('status', isEqualTo: true)
//           .orderBy('order')
//           .get();

//       final instructions = snapshot.docs
//           .map((doc) => PaymentInstruction.fromFirestore(doc))
//           .toList();
//       print(instructions);

//       emit(state.copyWith(
//         paymentInstructions: instructions,
//         paymentInstructionsLoading: false,
//       ));
//     } catch (e) {
//       // Set loading to false and handle the error
//       emit(state.copyWith(
//         paymentInstructionsLoading: false,
//       ));
//       // Optionally, you can add an error message field to WideState if needed
//       print('Failed to fetch payment instructions: $e');
//     }
//   }

//   // function that handle advert playing time
//   Future<void> _handleAd(
//     PlayerPositionData positionData,
//     WideState state,
//   ) async {
//     final duration = positionData.duration.inSeconds;
//     final currentDuration = positionData.position.inSeconds;
//     final currentIndex = state.audioPlayer?.currentIndex;
//     final media = state
//         .audioPlayer
//         ?.audioSource
//         ?.sequence[state.isAd ? 0 : state.audioPlayer!.currentIndex!]
//         .tag as MediaItem;
//     final isAd = media.extras?['ad'];
//     final lastTrigTime = percentageValue(
//       percentage: 90,
//       whole: duration,
//     );

//     print(
//         'Handling ad - isAd: $isAd, currentDuration: $currentDuration, duration: $duration, isTransitioning: $_isTransitioningFromAd');

//     if (isAd) {
//       if (duration > 0 && currentDuration == duration) {
//         print('Ad completed, triggering TrigAdvert with trig: false');
//         _isTransitioningFromAd = true;
//         add(
//           TrigAdvert(
//             trig: false,
//             currentDuration: state.continueDuration ?? Duration.zero,
//             currentIndex: currentIndex,
//             isLastAd: state.isLastAd,
//           ),
//         );
//         await state.audioPlayer?.setAudioSource(
//           state.playingPlaylist!,
//           initialIndex: state.continueIndex,
//           initialPosition: state.continueDuration,
//         );
//         await state.audioPlayer?.play();

//         Future.delayed(const Duration(milliseconds: 500), () {
//           _isTransitioningFromAd = false;
//         });
//       }
//     } else {
//       if (positionData.state.playing) {
//         getIt<ContinueListeningBloc>()
//             .add(ContinueListeningEvent.remove(media.id));
//       }

//       if (_isTransitioningFromAd) {
//         print('Skipping ad trigger during transition');
//         return;
//       }

//       if (!positionData.state.playing &&
//           (positionData.state.processingState == ProcessingState.ready ||
//               positionData.state.processingState == ProcessingState.idle)) {
//         final progress = calculatePercentage(
//           whole: state.audioPlayer!.duration!.inSeconds.toDouble(),
//           parts: state.audioPlayer!.position.inSeconds.toDouble(),
//         );
//         final audio = PausedAudio(
//           id: media.id,
//           progress: progress,
//           totalDuration: state.audioPlayer!.position.inSeconds.toDouble(),
//           pausedAtDuration: state.audioPlayer!.position.inSeconds.toDouble(),
//         );
//         getIt<ContinueListeningBloc>()
//             .add(ContinueListeningEvent.upsert(audio));
//       }

//       if (currentDuration == 0 && !_isTransitioningFromAd) {
//         final trigTime = duration <= 1200
//             ? percentageValue(
//                 percentage: 25,
//                 whole: duration,
//               )
//             : percentageValue(
//                 percentage: 5,
//                 whole: duration,
//               );
//         print('Initial trigger time calculated: $trigTime');

//         if (!state.adverts.containsKey(media.id)) {
//           print('Fetching adverts for media id: ${media.id}');
//           add(GetAdvert(media.id));
//         }
//         add(
//           TrigAdvert(
//             time: trigTime,
//             trig: false,
//             currentDuration: positionData.position,
//             currentIndex: currentIndex,
//           ),
//         );
//       } else if (currentDuration >= (state.advertTrigTime ?? 0)) {
//         if (!state.isLastAd) {
//           if (duration <= 1200) {
//             add(
//               TrigAdvert(
//                 time: lastTrigTime,
//                 trig: true,
//                 currentDuration: Duration(
//                   seconds: positionData.position.inSeconds + 1,
//                 ),
//                 currentIndex: currentIndex,
//                 isLastAd: lastTrigTime <= currentDuration,
//               ),
//             );
//           } else {
//             final intervalTime = Duration(
//               seconds: currentDuration + 900,
//             ).inSeconds;
//             final isLastAd = intervalTime > (duration - 120);

//             final nextTrigTime = isLastAd ? lastTrigTime : intervalTime;

//             add(
//               TrigAdvert(
//                 time: nextTrigTime,
//                 trig: true,
//                 currentDuration: Duration(
//                   seconds: positionData.position.inSeconds + 1,
//                 ),
//                 currentIndex: currentIndex,
//                 isLastAd: lastTrigTime <= currentDuration,
//               ),
//             );
//           }
//         }
//       }
//     }
//   }

//   @override
//   Future<void> close() async {
//     await sub?.cancel();
//     await playerSub?.cancel();
//     await playerStateSub?.cancel();
//     await state.audioPlayer?.dispose();
//     return super.close();
//   }
// }


// const { emails } = require("./email");
// const puppeteer = require("puppeteer");
// const { Bot } = require("grammy");
// const path = require("path");
// require("dotenv").config({ path: path.resolve(__dirname, ".env") });
// const moment = require("moment");
// const Promise = require("bluebird");

// const bot = new Bot(`${process.env.TELEGRAM_BOT_TOKEN}`);
// const delay = (milliseconds) =>
//   new Promise((resolve) => setTimeout(resolve, milliseconds));

// // const MCHATID = process.env.TELEGRAM_BOT_CHAT_ID;
// const targetDateChannel = process.env.TELEGRAM_CHANNEL_ID;
// const debugChannel = process.env.TELEGRAM_DEBUG_CHANNEL_ID;

// async function start() {
//   const startTime = moment();
//   const startMessage = `
// 🚀 Starting Scan
// ━━━━━━━━━━━━━━━
// ⏰ Start Time: ${startTime.format("MMMM Do, h:mm:ss a")}
// 📧 Total Emails: ${emails.length}
// ━━━━━━━━━━━━━━━`;

//   await bot.api.sendMessage(debugChannel, startMessage, {
//     parse_mode: "Markdown",
//   });

//   const browser = await puppeteer.launch({
//     headless: false,
//     args: [
//       "--disable-setuid-sandbox",
//       "--no-sandbox",
//       "--disable-dev-shm-usage",
//       "--disable-accelerated-2d-canvas",
//       "--disable-gpu",
//       "--window-size=1920x1080",
//       "--enable-javascript",
//       "--disable-notifications",
//       "--disable-extensions",
//       "--disable-web-security",
//       "--allow-running-insecure-content",
//       "--start-maximized",
//     ],
//     // defaultViewport: null,
//     ignoreHTTPSErrors: true,
//   });
//   let currentEmailIndex = 0;

//   // Process multiple emails concurrently
//   const batchSize = 10; // Adjust based on your system's capabilities
//   const actionDelay = 37000;

//   for (let i = 0; i < emails.length; i += batchSize) {
//     const batch = emails.slice(i, i + batchSize);
//     const batchStartTime = moment();

//     await Promise.map(
//       batch,
//       async (email, index) => {
//         let page = null;
//         const emailStartTime = moment();

//         try {
//           page = await browser.newPage();
//           currentEmailIndex = i + index;
//           console.log("Creating new page for email index:", currentEmailIndex);

//           const accountDelay = currentEmailIndex * actionDelay;
//           console.log("Account delay:", accountDelay);

//           // Set up page configurations
//           await page.setDefaultNavigationTimeout(120000);
//           console.log("Navigation timeout set");

//           await page.setRequestInterception(true);
//           console.log("Request interception enabled");

//           page.on("request", (request) => {
//             if (
//               ["image", "stylesheet", "font"].indexOf(
//                 request.resourceType()
//               ) !== -1
//             ) {
//               request.abort();
//             } else {
//               request.continue();
//             }
//           });
//           const userAgents = [
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//             "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/121.0.0.0 Safari/537.36",
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
//             "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
//             "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Edge/121.0.0.0",
//             "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0",
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
//             "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0",
//             "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
//             "Mozilla/5.0 (iPad; CPU OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Edge/120.0.0.0",
//           ];

//           // Set user agent before navigation
//           const randomUserAgent =
//             userAgents[Math.floor(Math.random() * userAgents.length)];
//           await page.setUserAgent(randomUserAgent);
//           console.log("User agent set:", randomUserAgent);

//           await page.setJavaScriptEnabled(true);
//           console.log("JavaScript enabled");

//           await delay(accountDelay);
//           console.log("Initial delay completed");

//           console.log("Navigating to login page...");
//           await page.goto(
//             "https://ais.usvisa-info.com/en-et/niv/users/sign_in",
//             {
//               waitUntil: ["networkidle0", "domcontentloaded"],
//             }
//           );
//           console.log("Login page loaded");

//           // Wait for form to be truly interactive
//           await page.waitForFunction(
//             () => {
//               const emailInput = document.querySelector(
//                 ".string.email.required"
//               );
//               const passwordInput = document.querySelector("#user_password");
//               return (
//                 emailInput &&
//                 passwordInput &&
//                 window.getComputedStyle(emailInput).display !== "none" &&
//                 window.getComputedStyle(passwordInput).display !== "none"
//               );
//             },
//             { timeout: 60000 }
//           );
//           console.log("Form elements are interactive");

//           // Clear fields before typing
//           await page.evaluate(() => {
//             document.querySelector(".string.email.required").value = "";
//             document.querySelector("#user_password").value = "";
//           });

//           // Type credentials with delay
//           await page.type(".string.email.required", email.username, {
//             delay: 100,
//           });
//           console.log("Email entered");

//           await page.type("#user_password", email.password, { delay: 100 });
//           console.log("Password entered");

//           await delay(4000);
//           console.log("Pre-checkbox delay completed");

//           // More reliable checkbox handling
//           await page.waitForFunction(() => {
//             const checkbox = document.querySelector(
//               ".radio-checkbox-group.margin-top-30 > label > div"
//             );
//             return checkbox && checkbox.offsetParent !== null;
//           });

//           await page.evaluate(() => {
//             const checkbox = document.querySelector(
//               ".radio-checkbox-group.margin-top-30 > label > div"
//             );
//             checkbox.click();
//           });
//           console.log("Checkbox clicked");

//           // More reliable submit button handling
//           await page.waitForFunction(
//             () => {
//               const submitBtn = document.querySelector(
//                 ".simple_form.new_user p input"
//               );
//               return submitBtn && submitBtn.offsetParent !== null;
//             },
//             { timeout: 60000 }
//           );

//           await Promise.all([
//             page.waitForNavigation(),
//             page.evaluate(() => {
//               document.querySelector(".simple_form.new_user p input").click();
//             }),
//           ]);
//           console.log("here2");

//           // Wait for the navigation menu with retry mechanism
//           console.log("Waiting for navigation menu...");
//           await page.waitForSelector(".medium-6.columns.text-right ul li a");
//           console.log("Navigation menu found");
//           await delay(5000);

//           // Wait for and click the continue button with better selector handling
//           console.log("Waiting for continue button...");
//           const continueButtonSelector =
//             "#main > div:nth-child(2) > div.mainContent > div:nth-child(1) > div > div > div:nth-child(1) > div.medium-6.columns.text-right > ul > li > a";
//           await page.waitForSelector(continueButtonSelector, {
//             visible: true,
//             timeout: 60000,
//           });
//           console.log("Continue button found");

//           await page.evaluate((selector) => {
//             const element = document.querySelector(selector);
//             if (element) {
//               element.click();
//             } else {
//               throw new Error("Continue button not found");
//             }
//           }, continueButtonSelector);
//           console.log("Continue button clicked");

//           // After clicking continue button, add more error handling and logging

//           // Wait for either the payment icon or an error message
//           console.log("Waiting for page load after continue...");
//           await page.waitForNavigation({
//             waitUntil: "networkidle0",
//             timeout: 60000,
//           });

//           // Add a small delay to ensure page is fully rendered
//           await delay(3000);

//           // Check if we're actually on the correct page
//           const currentUrl = page.url();
//           console.log("Current URL:", currentUrl);

//           // Wait for payment icon with better error handling
//           console.log("Waiting for payment icon...");
//           await page.waitForSelector(".fas.fa-money-bill-alt");
//           console.log("got payment icon");

//           await page.evaluate(() =>
//             document
//               .querySelector(
//                 "#forms > ul > li:nth-child(1) > div > div > div.medium-10.columns > p:nth-child(2) > a"
//               )
//               .click()
//           );

//           await delay(5000);

//           // } catch (iconError) {
//           //   console.log(
//           //     "Payment icon not found, checking alternative selectors..."
//           //   );
//           //   // Try alternative selectors or check for error messages
//           //   const pageContent = await page.content();
//           //   if (
//           //     pageContent.includes("error") ||
//           //     pageContent.includes("Error")
//           //   ) {
//           //     throw new Error("Page showed an error message");
//           //   }
//           //   throw iconError;
//           // }
//           console.log("Payment icon visible");
//           // } catch (navigationError) {
//           //   console.error("Navigation error:", navigationError);
//           //   // Take a screenshot for debugging
//           //   await page.screenshot({ path: `error-${Date.now()}.png` });
//           //   throw navigationError;
//           // }

//           // Wait for and extract slot date
//           console.log("Waiting for slot date...");
//           const slotDateSelector =
//             "#paymentOptions > div.medium-3.column > table > tbody > tr > td.text-right";
//           await page.waitForSelector(slotDateSelector);
//           console.log("Slot date element found");

//           const slotDate = await page.$eval(
//             slotDateSelector,
//             (el) => el.textContent
//           );
//           console.log("Slot date extracted:", slotDate);
//           console.log(moment().format("h:mm:ss a"));

//           let slot = `
// 🚨  Available Slot Found
// ━━━━━━━━━━━━━━━
// 🗓️ Date: ${slotDate}
// 🎯 Visa Type: *F1*
// ⏰ Found at: ${moment().format("h:mm:ss a")}
// 🔗 [Book here](https://ais.usvisa-info.com/en-et/niv/users/sign_in)
// ━━━━━━━━━━━━━━━`;

//           // Debug message with more details
//           const debugMessage = `
// 📍 New Slot Found
// ━━━━━━━━━━━━━━━
// 🗓️ Date: ${slotDate}
// 👤 Email: \`${email.username}\`
// 🎯 Type: *F1*
// ⏰ Found at: ${moment().format("h:mm:ss a")}
// 🔗 [Book here](https://ais.usvisa-info.com/en-et/niv/users/sign_in)
// ━━━━━━━━━━━━━━━`;

//           const firstDate = new RegExp("November");
//           const secondDate = new RegExp("December");
//           const thirdDate = new RegExp("January");
//           // const fourthDate = new RegExp("August");
//           // const fifthDate = new RegExp("September");

//           if (
//             firstDate.test(slotDate) ||
//             secondDate.test(slotDate) ||
//             thirdDate.test(slotDate)
//           ) {
//             await bot.api.sendMessage(targetDateChannel, slot, {
//               parse_mode: "Markdown",
//               disable_web_page_preview: true,
//             });
//           }

//           // await bot.api.sendMessage(debugChannel, debugMessage, {
//           //   parse_mode: "Markdown",
//           //   disable_web_page_preview: true,
//           // });

//           // When a slot is found, include timing information
//           const slotMessage = `
// 📍 New Slot Found
// ━━━━━━━━━━━━━━━
// 🗓️ Date: ${slotDate}
// 👤 Email: \`${email.username}\`
// 🎯 Type: *F1*
// ⏰ Found at: ${moment().format("h:mm:ss a")}
// ⌛ Process Time: ${moment().diff(emailStartTime, "seconds")}s
// 🔗 [Book here](https://ais.usvisa-info.com/en-et/niv/users/sign_in)
// ━━━━━━━━━━━━━━━`;

//           await bot.api.sendMessage(debugChannel, slotMessage, {
//             parse_mode: "Markdown",
//             disable_web_page_preview: true,
//           });

//           await page.close();
//         } catch (error) {
//           const errorInfo = {
//             email: email?.username || "Unknown email",
//             errorName: error.name,
//             errorMessage: error.message,
//             timestamp: moment().format("MMMM Do, h:mm:ss a"),
//             processTime: moment().diff(emailStartTime, "seconds"),
//             stackTrace: error.stack,
//             emailIndex: currentEmailIndex + 1,
//           };

//           const errorMessage = `
// ⚠️ Error Report
// ━━━━━━━━━━━━━━━
// 👤 Email: \`${errorInfo.email}\`
// ❌ Error: ${errorInfo.errorName}
// 📝 Message: ${errorInfo.errorMessage}
// #️⃣ Index: ${errorInfo.emailIndex}
// ⏰ Time: ${errorInfo.timestamp}
// ⌛ Process Time: ${errorInfo.processTime}s
// ━━━━━━━━━━━━━━━`;

//           await bot.api.sendMessage(debugChannel, errorMessage, {
//             parse_mode: "Markdown",
//           });
//           // await bot.api.sendMessage("414889833", errorMessage);
//           console.error("Detailed error:", errorInfo);
//           throw new Error(
//             `Scraping failed for ${errorInfo.email}: ${error.message}`
//           );
//         }
//       },
//       { concurrency: batchSize }
//     );

//     // Batch completion message
//     const batchMessage = `
// 📊 Batch Complete
// ━━━━━━━━━━━━━━━
// ✅ Processed: ${i + batch.length}/${emails.length} emails
// ⌛ Batch Time: ${moment().diff(batchStartTime, "seconds")}s
// ⏰ Time: ${moment().format("h:mm:ss a")}
// ━━━━━━━━━━━━━━━`;

//     await bot.api.sendMessage(debugChannel, batchMessage, {
//       parse_mode: "Markdown",
//     });
//   }

//   // Final completion message with total runtime
//   const endTime = moment();
//   const completionMessage = `
// 🏁 Scan Completed
// ━━━━━━━━━━━━━━━
// 📅 Start: ${startTime.format("MMMM Do, h:mm:ss a")}
// ⏰ End: ${endTime.format("h:mm:ss a")}
// ⌛ Total Runtime: ${endTime.diff(startTime, "minutes")}m ${
//     endTime.diff(startTime, "seconds") % 60
//   }s
// ✅ Emails Processed: ${emails.length}
// ━━━━━━━━━━━━━━━`;

//   await bot.api.sendMessage(debugChannel, completionMessage, {
//     parse_mode: "Markdown",
//   });

//   await browser
//     .close()
//     .catch((e) => console.error("Error closing browser:", e));
//   console.log("Scraping completed");
// }

// start();
