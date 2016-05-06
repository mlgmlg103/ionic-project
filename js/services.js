angular.module('client.services', [])

        /**
         * A simple example service that returns some data.
         */
        .factory('AppService', function ($http, $rootScope, $ionicPlatform) {



            return new function () {

                this._missingData = function (key) {
                    return !window.localStorage.getItem("iShare_" + key);
                };

                this._getData = function (key) {
                    var raw = window.localStorage.getItem("iShare_" + key);
                    if (raw) {
                        try {
                            return JSON.parse(raw);
                        } catch (err) {
                            console.log("failed to decode json");
                        }
                    }

                    return null;
                };

                this._saveData = function (key, value) {
                    window.localStorage.setItem("iShare_" + key, JSON.stringify(value));
                    return this;
                };

                this._clearData = function (key) {
                    window.localStorage.removeItem("iShare_" + key);
                    return this;
                };

                this._saveWithExpire = function (key, data, seconds) {
                    var value = {
                        expire: Date.now() + seconds * 1000,
                        data: data
                    };
                    return this._saveData(key, value);
                };

            var savedData = {};
             this.set = function(data){
               savedData = data;
             };
             this.get= function() {
              return savedData;
             };



                this._touch = function (key, seconds) {
                    var value = this._getData(key);
                    if (value) {
                        value["expire"] = Date.now() + seconds * 1000;
                    } else {
                        value = {
                            expire: Date.now() + seconds * 1000,
                            data: []
                        };
                    }
                    return this._saveData(key, value);
                };

                this._getAndCheck = function (key, expireCallback) {
                    var value = this._getData(key);

                    if (value) {
                        if (expireCallback) {
                            if (Date.now() > value["expire"]) {
                                expireCallback.call(this);
                            }
                        }
                        return value["data"];
                    } else {
                        if (expireCallback) {
                            expireCallback.call(this);
                        }
                        return null;
                    }
                };

                this.getUser = function () {
                    var user = this._getData("user");

                    if (!user) {
                        user = {
                            id: uuid(),
                            name: "",
                            phone: "",
                            store: ""
                        };
                        this._saveData("user", user);
                    }

                    return user;
                };

                this.saveUser = function (user) {
                    this._saveData("user", user);
                };

                this._callApi = function (method, data, success, fail) {
                    var apiURL = window.config.getApiBase() + "?v=1&app=" + window.config.appId;

                    var url = apiURL + "&method=" + method;

                    var _this = this;
                    $http.post(url, data).success(function (reply) {
                        if (reply.code === 0) {
                            success.call(_this, reply.reply);
                        } else {
                            console.log("call API " + method + " failed with error " + reply.code + " : " + reply.msg);
                            success.call(_this, null);
                        }
                    }).error(function (reply, status) {
                        console.log("call API server with error code " + status);
                        if (fail) {
                            fail.call(_this);
                        } else {
                            $rootScope.$broadcast("network.failed");
                        }
                    });
                };

                this._replySuccess = function (reply, key, expire) {
                    if (reply) {
                        this._saveWithExpire(key, reply, expire);
                    } else {
                        this._touch(key, 60);
                    }
                    $rootScope.$broadcast("data.refreshed", {key: key});
                };

                this._replyFail = function (key) {
                    this._touch(key, 60);
                    $rootScope.$broadcast("data.refreshed", {key: key});
                    $rootScope.$broadcast("network.failed", {key: key});
                };

                this.getGallery = function () {
                    return this._getAndCheck("gallery", function () {
                        this.loadGallery();
                    });
                };

                this.loadGallery = function () {
                    var key = "gallery";

                    this._callApi("slideshow", {slideshow: window.config.galleryId}, function (reply) {
                        this._replySuccess(reply, key, 300);
                    }, function () {
                        this._replyFail(key);
                    });
                };

                this.getStartUpImage = function () {
                    var gallery = this.getGallery();
                    if (gallery && gallery.length > 0) {
                        return gallery[0];
                    }
                    return null;
                };

                this.getShoppingCategories = function () {
                    return this._getAndCheck("shopping", function () {
                        this.loadProductCategories(window.config.shoppingTypeId, "shopping");
                    });
                };

                this.loadProductCategories = function (typeId, key) {
                    this._callApi("productCategories", {type: typeId}, function (reply) {
                        this._replySuccess(reply, key, 86400);
                    }, function () {
                        this._replyFail(key);
                    });
                };

                this.getShoppingSpecialKey = function () {
                    var cateId = window.config.shoppingSpecialCateId;
                    return "shop-item-" + cateId;
                };

                this.getShoppingSpecial = function () {
                    var cateId = window.config.shoppingSpecialCateId;
                    var key = this.getShoppingSpecialKey();
                    return this._getAndCheck(key, function () {
                        this.loadProductItems(cateId, key);
                    });
                };

                this.getProductItems = function (id) {
                    var key = "shop-item-" + id;
                    return this._getAndCheck(key, function () {
                        this.loadProductItems(id, key);
                    });
                };

                this.loadProductItems = function (id, key) {
                    this._callApi("productItems", {category: id}, function (reply) {
                        this._replySuccess(reply, key, 86400);
                    }, function () {
                        this._replyFail(key);
                    });
                };

                this.getCategories = function () {
                    return  this._getAndCheck("categories", function () {
                        this.loadCategories();
                    });
                };

                this.loadCategories = function () {
                    var key = "categories";
                    this._callApi("category", {}, function (reply) {
                        this._replySuccess(reply, key, 86400);
                    }, function () {
                        this._replyFail(key);
                    });
                };

                this.getCategory = function (id) {
                    var categories = this.getCategories();
                    if (categories) {
                        for (var i = 0; i < categories.length; i++) {
                            var category = categories[i];
                            if (category.id === id) {
                                return category;
                            }
                        }
                    }
                    return null;
                };

                this.getFoldStates = function () {
                    var states = this._getData("fold");
                    if (!states) {
                        states = {};
                    }
                    return states;
                };

                this.toggleFold = function (id) {
                    var states = this.getFoldStates();
                    if (states[id]) {
                        states[id] = false;
                    } else {
                        states[id] = true;
                    }
                    this._saveData("fold", states);
                };

                this.getItems = function (id) {
                    return this._getAndCheck("cate-item-" + id, function () {
                        this.loadItems(id);
                    });
                };

                this.loadItems = function (id) {
                    var key = "cate-item-" + id;
                    this._callApi("categoryItem", {category: id}, function (reply) {
                        this._replySuccess(reply, key, 900);
                    }, function () {
                        this._replyFail(key);
                    });
                };

                this.getFeatured = function () {
                    return  this._getAndCheck("featured", function () {
                        this.loadFeatured();
                    });
                };

                this.loadFeatured = function () {
                    var key = "featured";
                    this._callApi("item", {featured: true}, function (reply) {
                        this._replySuccess(reply, key, 3600);
                    }, function () {
                        this._replyFail(key);
                    });
                };

                this.getFlyers = function () {
                    return  this._getAndCheck("flyers", function () {
                        this.loadFlyers();
                    });
                };

                this.loadFlyers = function () {
                    var key = "flyers";
                    this._callApi("flyerList", {}, function (reply) {
                        this._replySuccess(reply, key, 3600);
                    }, function () {
                        this._replyFail(key);
                    });
                };

                this.getFlyer = function (id) {
                    var flyers = this.getFlyers();
                    if (flyers) {
                        for (var i = 0; i < flyers.length; i++) {
                            var flyer = flyers[i];
                            if (flyer.id == id) {
                                return flyer;
                            }
                        }
                    }
                    return null;
                };

                this.getFlyerPages = function (id) {
                    return  this._getAndCheck("flyer-" + id, function () {
                        this.loadFlyerPages(id);
                    });
                };

                this.loadFlyerPages = function (id) {
                    var key = "flyer-" + id;
                    this._callApi("flyer", {flyer: id}, function (reply) {
                        this._replySuccess(reply, key, 86400);
                    }, function () {
                        this._replyFail(key);
                    });
                };

                this.groupArray = function (input, cols) {
                    if (!input) {
                        return input;
                    }

                    var output = [];
                    var i, j;

                    for (i = 0; i < input.length; i += cols) {
                        var row = [];
                        for (j = 0; j < cols && i + j < input.length; j++) {
                            row.push(input[i + j]);
                        }
                        output.push(row);
                    }

                    return output;
                };

                this.getColumns = function () {
                    return 4; // could be 2, 3, 4, 5, 10
                };

                this.submitMessage = function (name, phone, email, msg, callback) {
                    this._callApi("message", {name: name, phone: phone, email: email, content: msg}, function (reply) {
                        callback(true);
                    }, function () {
                        callback(false);
                    });
                };

                this._injectMapJs = false;

                this.initGoogleMap = function (mapDivId, markerClickedCallback) {
                    window.initializeGoogleMap = function () {
                        var mapProp = {
                            center: new google.maps.LatLng(window.config.latLon[0], window.config.latLon[1]),
                            zoom: 15,
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            streetViewControl: false,
                            mapTypeControl: false
                        };
                        var map = new google.maps.Map(document.getElementById(mapDivId), mapProp);
                        var marker = new google.maps.Marker({
                            position: new google.maps.LatLng(window.config.latLon[0], window.config.latLon[1])
                        });
                        marker.setMap(map);
                        var infoWindow = new google.maps.InfoWindow({
                            content: window.config.name + "<br>" + window.config.address[0]
                        });
                        infoWindow.open(map, marker);
                        google.maps.event.addListener(marker, "click", function () {
                            markerClickedCallback();
                        });
                        // once google map loaded, we need to replace target=_blank to _system, so it can be opened
                        // in external browser
                        google.maps.event.addListener(map, "idle", function () {
                            var anchors = document.getElementById(mapDivId).getElementsByTagName("a");
                            angular.forEach(anchors, function (aElem) {
                                var elem = angular.element(aElem);
                                if (elem.attr("target") === "_blank") {
                                    elem.on("click", function (e) {
                                        e.preventDefault();
                                        var link = elem.attr("href");
                                        window.open(link, "_system");
                                    });
                                }
                            });
                        });
                    };
                    if (!this._injectMapJs) {
                        this._injectMapJs = true;

                        var script = document.createElement("script");
                        script.src = "https://maps.googleapis.com/maps/api/js?key=" + window.config.googleApiKey + "&sensor=false&callback=initializeGoogleMap";
                        document.body.appendChild(script);
                    } else {
                        initializeGoogleMap();
                    }
                };

                this.openMap = function (address) {
                    var cord = address.latLon[0] + "," + address.latLon[1];
                    var geoURL;

                    if (ionic.Platform.isIOS()) {
                        geoURL = "maps://maps.apple.com/?q=" + encodeURIComponent(address.address.join(" "));
                    } else {
                        geoURL = "geo:" + cord + "?q=" + cord + "(" + address.name + ")";
                    }
                    window.open(geoURL, "_system");
                };

                this.imageCacheInitState = null;
                this.imageCacheIniting = false;
                this.imageCachePendingCallbacks = [];
                this.imgCacheReady = function (callback) {
                    if (this.imageCacheInitState !== null) {
                        callback(this.imageCacheInitState);
                    } else {
                        this.imageCachePendingCallbacks.push(callback);
                        if (!this.imageCacheIniting) {
                            this.imageCacheIniting = true;

                            var _this = this;
                            $ionicPlatform.ready(function () {
                                if (window.config.runInApp) {
                                    ImgCache.options.debug = false;
                                } else {
                                    ImgCache.options.debug = true;
                                }
                                ImgCache.init(
                                        function () {
                                            _this.imageCacheInitState = true;
                                            angular.forEach(_this.imageCachePendingCallbacks, function (callbackItem) {
                                                callbackItem(_this.imageCacheInitState);
                                            });
                                        },
                                        function () {
                                            _this.imageCacheInitState = false;
                                            console.log("cache init failed");
                                            angular.forEach(_this.imageCachePendingCallbacks, function (callbackItem) {
                                                callbackItem(_this.imageCacheInitState);
                                            });
                                        }
                                );
                            });
                        }
                    }


                };

                this.getShoppingList = function () {
                    var list = this._getData('shopping-list');
                    if (list === null) {
                        list = [];
                    }
                    return list;
                };

                this.addShoppingList = function (name, memo, callback) {
                    var list = this.getShoppingList();
                    list.push({
                        id: Date.now(),
                        name: name,
                        memo: memo,
                        checked: false
                    });
                    this._saveData('shopping-list', list);
                    $rootScope.$broadcast("data.refreshed", {key: 'shopping-list'});
                    callback();
                };

                this.updateShoppingList = function (item) {
                    var list = this.getShoppingList();
                    var i;
                    for (i = 0; i < list.length; i++) {
                        if (list[i].id === item.id) {
                            break;
                        }
                    }
                    if (i < list.length) {
                        list[i] = item;
                        this._saveData('shopping-list', list);
                        $rootScope.$broadcast("data.refreshed", {key: 'shopping-list'});
                    }
                };

                this.removeFromShoppingList = function (id) {
                    var list = this.getShoppingList();
                    var i;
                    for (i = 0; i < list.length; i++) {
                        if (list[i].id === id) {
                            break;
                        }
                    }
                    if (i < list.length) {
                        list.splice(i, 1);
                        this._saveData('shopping-list', list);
                        $rootScope.$broadcast("data.refreshed", {key: 'shopping-list'});
                    }
                };

                this.clearShoppingList = function () {
                    this._saveData('shopping-list', []);
                    $rootScope.$broadcast("data.refreshed", {key: 'shopping-list'});
                };

                this.getCart = function () {
                    var list = this._getData('cart');
                    if (list === null) {
                        list = [];
                    }
                    return list;
                };

                this.clearCart = function () {
                    this._saveData('cart', []);
                    $rootScope.$broadcast("cart.updated");
                };

                this.addToCart = function (item) {
                    var list = this.getCart();
                    var i;
                    for (i = 0; i < list.length; i++) {
                        if (list[i].item.id === item.id) {
                            list[i].quantity++;
                            break;
                        }
                    }
                    if (i === list.length) {
                        list.push({item: item, quantity: 1});
                    }
                    this._saveData('cart', list);
                    $rootScope.$broadcast("cart.updated");
                };

                this.updateCart = function (item, quantity) {
                    var list = this.getCart();
                    var i;
                    for (i = 0; i < list.length; i++) {
                        if (list[i].item.id === item.id) {
                            list[i].quantity = quantity;
                            break;
                        }
                    }
                    if (i === list.length) {
                        list.push({item: item, quantity: quantity});
                    }
                    this._saveData('cart', list);
                    $rootScope.$broadcast("cart.updated");
                };

                this.getCartItemCount = function () {
                    var count = 0;
                    var list = this.getCart();
                    angular.forEach(list, function (item) {
                        count = count + item.quantity;
                    });

                    return count;
                };

                this.preCheckout = function (callback) {
                    var items = [];

                    var list = this.getCart();
                    angular.forEach(list, function (item) {
                        items.push({id: item.item.id, quantity: item.quantity});
                    });
                    this._callApi('checkOrder', {items: items}, function (reply) {
                        callback(reply);
                    }, function () {
                        callback(null);
                    });
                };

                this.createOrder = function (preOrder, name, phone, store, callback) {
                    var user = this.getUser();
                    this._callApi('createOrder', {pre: preOrder, user: user.id, name: name, phone: phone, store: store}, function (reply) {
                        this.addToOrderList(reply);
                        callback(reply);
                    }, function () {
                        callback(null);
                    });
                };

                this.addToOrderList = function (order) {
                    this.saveOrderItems(order.id, order.items);
                    delete order.items;
                    var orders = this.getOrderList();
                    if (!orders) {
                        orders = [];
                    }
                    orders.push(order);
                    this._saveWithExpire('orders', orders, 60);
                    $rootScope.$broadcast("orders.refreshed");
                };

                this.getNumPendingOrders = function () {
                    var orders = this.getOrderList();
                    var num = 0;
                    if (orders) {
                        angular.forEach(orders, function (order) {
                            var status = order.status;
                            if (status === 'new' || status === 'processing' || status === 'ready') {
                                num++;
                            }
                        });
                    }

                    return num;
                };

                this.getOrderList = function () {
                    return this._getAndCheck('orders', function () {
                        this.loadOrderList();
                    });
                };

                this.loadOrderList = function () {
                    var user = this.getUser();
                    this._callApi('getOrders', {user: user.id}, function (reply) {
                        this._saveWithExpire('orders', reply, 60);
                        $rootScope.$broadcast("orders.refreshed");
                    }, function () {

                    });
                };

                this.saveOrderItems = function (id, items) {
                    this._saveWithExpire("order-" + id, items, 86400);
                };

                this.getOrderItems = function (id) {
                    return  this._getAndCheck("order-" + id, function () {
                        this.loadOrderItems(id);
                    });
                };

                this.loadOrderItems = function (id) {
                    var user = this.getUser();
                    this._callApi('getOrderItems', {user: user.id, order: id}, function (reply) {
                        this.saveOrderItems(id, reply);
                        $rootScope.$broadcast("orderItems.refreshed", {id: id});
                    }, function () {

                    });
                };

                this._creatFormsArray = function (key, array) {

                    this._saveData(key, array);

                };

                this._initForms = function () {
                    var Array = [];

                    if (this._getData("forms") === null) {
                        this._creatFormsArray("forms", Array);

                    }

                    if (this._getData("p_forms") === null) {

                        this._creatFormsArray("p_forms", Array);
                    }
                    if (this._getData("f_forms") === null) {
                        this._creatFormsArray("f_forms", Array);
                    }
                };
//
//                this._getForms = function (key) {
//
//                    return this._getData(key);
//
//                };

                this.addForm = function (key, form) {

                    var formsArray = this._getData(key);
                    formsArray.push(form);
                    this._saveData(key, formsArray);

                };

                this.adminID = 0;

                this.hasLogin = function () {
                    return (this.adminID > 0);
                };

                this.login = function () {
                    this.adminID = 1;
                };

                this.logout = function () {
                    this.adminID = 0;
                };

                this.formNumber = function (i) {
                    return i;
                };


            };
        });
