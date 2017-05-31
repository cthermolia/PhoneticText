'use strict';
var PhoneticText = function () {
    var _ = {
        utils: {
            apiCall: {
                phoneticText: {
                    text: '/webserv/api/text',
                    
                }
            },
            ajaxCall: function (url, method, data, retType, onSuccess, onError) {
                $.ajax({
                    type: method,
                    url: url,
                    data: data,
                    dataType: retType,
                    success: function (data) {
                        if (onSuccess)
                            onSuccess(data);
                    },
                    error: function (err) {
                        if (onError)
                            onError(err);
                    }
                });
            },
            find: function (a, key, i, c) {
                var p = null, o = null;
                for (var w = 0; w < a.length; w++) {
                    if (a[w][key] === i) {
                        p = w;
                        o = a[w];
                        break;
                    }
                }
                if (c && o)
                    c(o, p);
                else
                    return o;
            },
            findKey: function (a, i, c) {
                var p = null, o = null;
                for (var k in a) {
                    if (k === i) {
                        p = k;
                        o = a[k];
                        break;
                    }
                }
                if (c && o)
                    c(o, p);
                else
                    return o;
            },
            hashCode: function (s) {
                return s.split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                }, 0);
            },
            changeCss: function (e, styleKey, styleVal) {
                $(e).css(styleKey, styleVal);
            }
        }
    };
    return _;
}();