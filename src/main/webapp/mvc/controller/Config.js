var PhoneticTextApp = angular.module('PhoneticTextApp', ['ngRoute', 'ngCookies', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'blockUI', 'toaster',
    'textCtrlMod']);

PhoneticTextApp.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
                when('/', {
                    title: 'Text',
                    templateUrl: 'mvc/view/text.html',
                    controller: 'TextCtrl',
                    active: ['text'],
                    publicAccess: true
                }).                
                when('/404', {/* ERRORS */
                    title: '404',
                    templateUrl: 'mvc/view/404.html',
                    publicAccess: true
                }).
                when('/403', {
                    title: '403',
                    templateUrl: 'mvc/view/403.html',
                    publicAccess: true
                }).
                otherwise({
                    redirectTo: '/404'
                });
    }]);

PhoneticTextApp.run(['$http', '$location', '$rootScope', '$cookieStore', '$route', function ($http, $location, $rootScope, $cookieStore, $route) {

//        $rootScope.checkSession = function (g, onAuth, onRestrict) {
//            var globals = g || $cookieStore.get('globals') || {};
//            if (!globals.SessionID) {
//                if (onRestrict)
//                    onRestrict();
//            } else {
//                if (onAuth)
//                    onAuth();
//            }
//        };
//
//        $rootScope.checkRoles = function (roles, onCallback) {
//            var globals = $cookieStore.get('globals') || {};
//            $rootScope.checkSession(globals, function () {
//                var containsRole = false;
//                for (var i in roles) {
//                    if ($rootScope.hasRole(roles[i], globals)) {
//                        containsRole = true;
//                        break;
//                    }
//                }
//                if (onCallback)
//                    onCallback(containsRole);
//            }, function () {
//                if (onCallback)
//                    onCallback(false);
//            });
//        };
//
//        $rootScope.hasRole = function (role, g) {
//            var globals = g || ($cookieStore.get('globals') || {});
//            if (!globals.Roles) {
//                return false;
//            }
//            return globals.Roles.indexOf(role) >= 0;
//        };
//
//
//        $rootScope.hasRoleName = function (roleName, g) {
//            var globals = g || ($cookieStore.get('globals') || {});
//            if (!globals.RoleName) {
//                return false;
//            }
//            return globals.RoleName.indexOf(roleName) >= 0;
//        };
//
//        $rootScope.getPrincipal = function (g) {
//            var globals = g || $cookieStore.get('globals') || {};
//            return globals.Username;
//        };
//        
//        $rootScope.findDemoCustomization = function () {
//            return WebKmUI.utils.demoCustomization.parameter ? WebKmUI.utils.demoCustomization.parameter : -1;
//        };
//
//        $rootScope.isLoggedIn = function (g) {
//            var cook = g || $cookieStore.get('globals') || {};
//            return cook.SessionID ? true : false;
//        };
//
//        $rootScope.isConfirmed = function (g) {
//            var cook = g || $cookieStore.get('globals') || {};
//            return cook.Confirmed;
//        };
//
//        $http.WebKmUI = {
//            xhrCall: function (url, method, form, onSuccess, onError) {
//                var dataString = Object.keys(form.data ? form.data : {}).map(function (key) {
//                    return encodeURIComponent(key) + '=' + (form.data[key] ? encodeURIComponent(form.data[key]) : '');
//                }).join('&');
//
//                $http({
//                    url: url,
//                    method: method,
//                    data: dataString,
//                    params: form.params ? form.params : {},
//                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8;'}
//                }).success(function (response, status, headers, config) {
//                    if (response.status === 401 || response.exception === 'Authenticated access required') {
//                        $cookieStore.put('globals', {});
//                    } else if (onSuccess) {
//                        onSuccess(response);
//                    }
//                }).error(function (response, status, headers, config) {
//                    if (onError)
//                        onError(response);
//                });
//            },
//            fileUpload: function (url, file, onSuccess, onError) {
//                var fd = new FormData();
//                fd.append('file', file);
//                $http.post(url, fd, {
//                    transformRequest: angular.identity,
//                    headers: {'Content-Type': undefined}
//                }).success(function (response, status, headers, config) {
//                    if (onSuccess)
//                        onSuccess(response);
//                }).error(function (response, status, headers, config) {
//                    if (onError)
//                        onError(response);
//                });
//            },
//
//        };
//
//        (function () {
//            if (!$rootScope.isLoggedIn()) {
//                return;
//            }
//
//            $http.WebKmUI.xhrCall(WebKmUI.utils.apiCall.user.profile, 'GET', {},
//                    function (response) {
//                        if (response.uid) {
//                            var roles = [];
//                            roles.push('ROLE_USER');
//
//                            var globals = {
//                                SessionID: 'logged_in',
//                                Username: response.uid,
//                                Uid: response.uid,
//                                Confirmed: true,
//                                Roles: roles
//                            };
//                            $cookieStore.put('globals', globals);
//                        } else {
//                            $cookieStore.put('globals', {});
//                        }
//                    }, function (response) {
//                $cookieStore.put('globals', {});
//            });
//        }());
//
//        $rootScope.$on("$locationChangeStart", function (event, next, current) {
//
//        });
//
//        $rootScope.$on('$routeChangeStart', function (event, current, previous) {
//            var globals = $cookieStore.get('globals') || {};
//            var access = current.publicAccess || $route.routes[current.redirectTo || current.originalPath].publicAccess || false;
//            if (!access) {
//                $rootScope.checkSession(globals, function () {
//                    if (current.roles && current.roles.length > 0) {
//                        $rootScope.checkRoles(current.roles, function (hashRole) {
//                            if (!hashRole) {
//                                console.log('Redirect to 403..');
//                                $location.path('/403').search({});
//                            }
//                        });
//                    }
//                }, function () {
//                    console.log('Redirect to login..');
//                    $location.path('/login').search({});
//                });
//            }
//        });
//
//        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
//
//            if (current && current.hasOwnProperty('$$route')) {
//                $rootScope.title = current.title;
//                $rootScope.active = current.active;
//            }
//            ;
//        });
    }]);