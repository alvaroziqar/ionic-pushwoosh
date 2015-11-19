// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('PushWooshCtrl', function($scope, $rootScope, $ionicPlatform, PushWoosh) {  
 
  $scope.deviceToken = "";
 
  // listen for Push notification event
  $rootScope.$on("event:push-notification", function(event, result) {      
    alert(result.title);
    console.log(result);      
  });

  $scope.startPushWoosh = function() {
    $ionicPlatform.ready(function() {
 
      PushWoosh.init("<PUSHWOOSH_APP_ID>", "<GOOGLE_PROJECT_NUMBER>").then(
        // Init success
        function() {
          // Registrar dispositivo para obtener el token
          PushWoosh.registrarDispositivo().then(
            // Registro success
            function(token) {
              $scope.deviceToken = token;
              console.log("Dispositivo registrado");              
            },
            // Registro Error
            function(err) {
              console.log(err);
            }
          );
        },
        // Init error
        function(err) {
          console.log("Error al inicializar PushWoosh " + err);
        }
 
      );
 
    });
  }
 
})

.factory('PushWoosh', function($q, $rootScope, $window) {

  var service = {};
 
  $window.addEventListener('push-notification', function(event) {
 
    var notification = {};
 
    if(ionic.Platform.isIOS()) {
      notification.title = event.notification.aps.alert;
      notification.meta = event.notification.u;      
      pushNotification.setApplicationIconBadgeNumber(0);
    }
    
    if(ionic.Platform.isAndroid()) {
      notification.title = event.notification.title;
      notification.meta = event.notification.userdata;      
    }
 
    // No testeado
    if(ionic.Platform.isWindowsPhone()) {
      notification.title = event.notification.content;
      notification.meta = event.notification.userdata;
    }    
                                 
    $rootScope.$broadcast('event:push-notification', notification);
 
  });

  // Metodo para inicializar PushWoosh 
  service.init = function(PUSHWOOSH_APP_ID, GOOGLE_PROJECT_NUMBER) {
    var deferred = $q.defer();
 
    if(!PUSHWOOSH_APP_ID) {
      deferred.reject('No existe PushWoosh App Id');
    }
    else {
      // Inicializamos el plugin
      var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");
 
      // Actuamos según la plataforma
      // Para IOS
      if(ionic.Platform.isIOS()) {
        pushNotification.onDeviceReady({pw_appid: PUSHWOOSH_APP_ID});
        // seteamos el badge de la app a 0
        pushNotification.setApplicationIconBadgeNumber(0);
      }
      // Para Android
      if(ionic.Platform.isAndroid()) {
        pushNotification.onDeviceReady({projectid: GOOGLE_PROJECT_NUMBER, pw_appid: PUSHWOOSH_APP_ID});
      }
 
      // Para Windows Phone (no testeado)
      if(ionic.Platform.isWindowsPhone()) {
        pushNotification.onDeviceReady({appid: PUSHWOOSH_APP_ID, serviceName: ''});
      }
 
      deferred.resolve();
    }
 
    return deferred.promise;
  }

  // Metodo para registrar el dispositivo
  service.registrarDispositivo = function() {
    var deferred = $q.defer();
   
    // Inicializamos el plugin
    var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");
   
    // Registramos el dispositivo
    pushNotification.registerDevice(
      //success
      function(status) {
        var deviceToken;
   
        if(ionic.Platform.isIOS()) {
          deviceToken = status['deviceToken'];          
        }
   
        if(ionic.Platform.isAndroid()) {
          deviceToken = status;          
        }
   
        // No testeado
        if(ionic.Platform.isWindowsPhone()) {
          deviceToken = status;          
        }
   
        deferred.resolve(deviceToken);
      },
      // error
      function(status) {
        deferred.reject(status);
      }
    );
   
    return deferred.promise;
  }
 
  // Devolvemos las funciones del factory
  return service;

})
