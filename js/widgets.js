angular.module('client.widgets', ['ionic'])
        .filter("phone", function () {
            return function (input) {
                if (input) {
                    return "(" + input.substring(0, 3) + ") " + input.substring(3, 6) + " " + input.substring(6, 10);

                }
            };
        })


        .filter("cardNumber", function () {
            return function (input) {
                if (input) {
                    return input.substring(0, 4) + "-" + input.substring(4, 8) + "-" + input.substring(8, 12) + "-" + input.substring(12, 16);
                }
            };
        })
        .directive('custom', function () {
            return {
                restrict: "A",
                require: ['ngModel'],
                link: function (scope, element, attrs, ctrls) {
                    var model = ctrls[0];
                    scope.next = function () {
                        return model.$valid;
                    };
                    scope.$watch(scope.next, function (newValue) {  
                        if (newValue && model.$dirty)
                        {
                            var nextinput = element.next('input');

                            if (nextinput.length === 1)
                            {
                                nextinput[0].focus();
                                nextinput[0].focus();
                            }
                        }
                    });
                }
            };
        })
        ;