angular.module('client.controllers', ["client.widgets"])

        .controller('AppCtrl', function ($scope, AppService, $ionicPopup, $ionicModal, $state, $timeout) {
            // Form data for the login modal
            $scope.loginData = {};
            AppService.logout();



            // Create the login modal that we will use later
            $ionicModal.fromTemplateUrl('templates/modal-login.html', {
                scope: $scope,
                focusFirstInput: true
            }).then(function (modal) {

                $scope.modal = modal;

            });

            // Triggered in the login modal to close it
            $scope.closeLogin = function () {

                $scope.modal.hide();

            };

            // Open the login modal
            $scope.login = function () {

                $scope.modal.show();

            };

            var showFailLogin = function () {
                var errorPopup = $ionicPopup.alert({
                    title: 'Wrong Password!',
                    template: 'Pleas try again!'
                });
                errorPopup.then(function (res) {
                    $scope.modal.show();
                });

            };
            // Check Password
            $scope.doLogin = function () {

                if ($scope.loginData.password === window.config.adminPSW) {
                    $scope.loginData.password = "";
                    AppService.login();
                    $state.go('admin.forms');

                } else {
                    showFailLogin();
                    $scope.loginData.password = "";
//                    $state.go('app.signup');
                }
                ;
                $timeout(function () {
                    $scope.closeLogin();
                }, 200);

            };


        })

        .controller('taskCtrl', function ($scope, $ionicPopup, AppService) {
            $scope.loadHotelName = function(){
                $cope.hotelName = ""
            }
            $scope.loadTask = function(){
                $scope.tasks = [
                    {'id' : 1, 'room': 'R2301', 'status':'未完成'},
                    {'id' : 2, 'room': 'R2302', 'status':'未完成'},
                    {'id' : 3, 'room': 'R2303', 'status':'未完成'}
                ]
            }
          
            $scope.loadTask();

            $scope.openTask = function(task){
                AppService.set(task);
                $scope.newTask = AppService.get();
                console.log($scope.newTask);


            }
        })


        .controller('SignupCtrl', function ($scope, $ionicPopup, AppService) {
            AppService._initForms();
            var reset = function () {
                $scope.cx = {
                    cardNo1: "",
                    cardNo2: "",
                    cardNo3: "",
                    cardNo4: "",
                    f_name: "",
                    l_name: "",
                    gender: "",
                    phone: "",
                    provinces: "",
                    subscription: "false"

                };
            };

            reset();
            var showSuccess = function () {
                var successPopup = $ionicPopup.alert({
                    title: 'Thank You',
                    template: 'Your information has been submitted!'
                });
                successPopup.then(function (res) {

                });

                $scope.ValidatePassKey = function (tb) {
                    if (tb.TextLength >= 4)
                        document.getElementById(tb.id + 1).focus();
                };


            };

            $scope.submitForm = function () {
                var form = {
                    id: Date.now(),
                    cardNumber: $scope.cx.cardNo1 + $scope.cx.cardNo2 + $scope.cx.cardNo3 + $scope.cx.cardNo4,
                    firstName: $scope.cx.f_name,
                    lastName: $scope.cx.l_name,
                    gender: $scope.cx.gender,
                    email: $scope.cx.email,
                    phoneNumber: $scope.cx.phone,
                    address: $scope.cx.address,
                    city: $scope.cx.city,
                    provinces: $scope.cx.provinces,
                    subscription: $scope.cx.subscription

                };
                AppService.addForm("forms", form);
                showSuccess();
                reset();
            };



        })

        .controller('AdminCtrl', function ($scope, $ionicModal, $ionicPopup, $state, AppService) {
            AppService._initForms();
            $scope.forms = AppService._getData("forms");
            $scope.p_forms = AppService._getData("p_forms");
            $scope.f_forms = AppService._getData("f_forms");


            $scope.logOut = function () {
                AppService.logout();
                $state.go('app.signup');
            };
            var checkLogin = function () {

                console.log(AppService.hasLogin());
                if (!AppService.hasLogin()) {


                    var successPopup = $ionicPopup.alert({
                        title: 'Please Login',
                        template: 'You will be redirect to Signup Page!'
                    });
                    successPopup.then(function (res) {
                        $state.go('app.signup');
                    });
                }
            };

//            checkLogin();

            $ionicModal.fromTemplateUrl('templates/modal-form.html', {
                scope: $scope,
                animation: 'slide-in-right'
                , focusFirstInput: true
            }).then(function (modal) {
                $scope.modal = modal;
            });

            $scope.closeForm = function () {

                $scope.modal.hide();
            };

            $scope.openForm = function (item) {

                $scope.currForm = item;
                                    console.log($scope.currForm)
                if ($scope.currForm){

                $scope.modal.show();
            }
            };

            $scope.moveForm = function (form, fromIndex, toIndex) {
                $scope.forms.splice(fromIndex, 1);
                $scope.forms.splice(toIndex, 0, form);
            };

            $scope.deleteForm = function (key, form, forms) {

                forms.splice(forms.indexOf(form), 1);
                AppService._saveData(key, forms);

            };

            $scope.sendForm = function (form) {
                $scope.p_forms.push(form);
                $scope.deleteForm("forms", form, $scope.forms);
                AppService._saveData("forms", $scope.forms);
                AppService._saveData("p_forms", $scope.p_forms);
            };

            $scope.sendAll = function () {
                var i;

                for (i = 0; i < $scope.forms.length; i++) {
                    console.log(i);
                    console.log($scope.forms[i]);
                    $scope.p_forms.push($scope.forms[i]);
                }
                $scope.forms = [];
                AppService._saveData("forms", $scope.forms);
                AppService._saveData("p_forms", $scope.p_forms);
            };

            $scope.deleteAll = function (forms) {
                $scope.p_forms = [];
                AppService._saveData("p_forms", $scope.p_forms);
            };


        })

        .controller('FormCtrl', function ($scope, AppService) {


        })
        .controller('PendingCtrl', function ($scope, $ionicModal) {
        })

        .controller('FailCtrl', function ($scope, $ionicModal) {
        })
        ;
