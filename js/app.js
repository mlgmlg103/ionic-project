angular.module('client', ['ionic', 'client.controllers', 'client.services'])

        .run(function ($ionicPlatform) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }
            });
        })

        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider

                    .state('app', {
                        url: "/app",
                        abstract: true,
                        templateUrl: "templates/menu.html",
                        controller: 'AppCtrl'
                    })
                    // .state('app.client', {
                    //     url: "/client",
                    //     views: {
                    //         'menuContent': {
                    //             templateUrl: "templates/signup.html",
                    //             controller: 'SignupCtrl'
                    //         }
                    //     }
                    // })
                    .state('app.client', {
                        url: "/client",
                        views: {
                            'menuContent': {
                                templateUrl: "templates/task-list.html",
                                controller: 'taskCtrl'
                            }
                        }
                    })
                    .state('admin', {
                        url: "/admin",
                        abstract: true,
                        templateUrl: "templates/adminMenu.html",
                        controller: 'AdminCtrl'
                    })
                    .state('admin.forms', {
                        url: "/forms",
                        views: {
                            'forms': {
                                templateUrl: "templates/forms.html",
//                                controller: 'FormCtrl'
                            }
                        }
                    })
                    .state('admin.pending', {
                        url: "/pending",
                        views: {
                            'pending': {
                                templateUrl: "templates/pending.html",
//                                controller: 'PendingCtrl'
                            }
                        }
                    })
                    .state('admin.fail', {
                        url: "/fail",
                        views: {
                            'fail': {
                                templateUrl: "templates/fail.html",
//                                controller: 'FailCtrl'
                            }
                        }
                    })
                    ;
            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/app/client');
        });

