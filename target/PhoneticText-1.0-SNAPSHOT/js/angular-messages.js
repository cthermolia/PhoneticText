/**
 * @license AngularJS v1.5.9-build.5006+sha.e3a378e
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular) {'use strict';

var forEach;
var isArray;
var isString;
var jqLite;

angular.module('ngMessages', [], function initAngularHelpers() {
  // Access helpers from angular core.
  // Do it inside a `config` block to ensure `window.angular` is available.
  forEach = angular.forEach;
  isArray = angular.isArray;
  isString = angular.isString;
  jqLite = angular.element;
})

  .directive('ngMessages', ['$animate', function($animate) {
    var ACTIVE_CLASS = 'ng-active';
    var INACTIVE_CLASS = 'ng-inactive';

    return {
      require: 'ngMessages',
      restrict: 'AE',
      controller: ['$element', '$scope', '$attrs', function NgMessagesCtrl($element, $scope, $attrs) {
        var ctrl = this;
        var latestKey = 0;
        var nextAttachId = 0;

        this.getAttachId = function getAttachId() { return nextAttachId++; };

        var messages = this.messages = {};
        var renderLater, cachedCollection;

        this.render = function(collection) {
          collection = collection || {};

          renderLater = false;
          cachedCollection = collection;

          // this is true if the attribute is empty or if the attribute value is truthy
          var multiple = isAttrTruthy($scope, $attrs.ngMessagesMultiple) ||
                         isAttrTruthy($scope, $attrs.multiple);

          var unmatchedMessages = [];
          var matchedKeys = {};
          var messageItem = ctrl.head;
          var messageFound = false;
          var totalMessages = 0;

          // we use != instead of !== to allow for both undefined and null values
          while (messageItem != null) {
            totalMessages++;
            var messageCtrl = messageItem.message;

            var messageUsed = false;
            if (!messageFound) {
              forEach(collection, function(value, key) {
                if (!messageUsed && truthy(value) && messageCtrl.test(key)) {
                  // this is to prevent the same error name from showing up twice
                  if (matchedKeys[key]) return;
                  matchedKeys[key] = true;

                  messageUsed = true;
                  messageCtrl.attach();
                }
              });
            }

            if (messageUsed) {
              // unless we want to display multiple messages then we should
              // set a flag here to avoid displaying the next message in the list
              messageFound = !multiple;
            } else {
              unmatchedMessages.push(messageCtrl);
            }

            messageItem = messageItem.next;
          }

          forEach(unmatchedMessages, function(messageCtrl) {
            messageCtrl.detach();
          });

          if (unmatchedMessages.length !== totalMessages) {
            $animate.setClass($element, ACTIVE_CLASS, INACTIVE_CLASS);
          } else {
            $animate.setClass($element, INACTIVE_CLASS, ACTIVE_CLASS);
          }
        };

        $scope.$watchCollection($attrs.ngMessages || $attrs['for'], ctrl.render);

        // If the element is destroyed, proactively destroy all the currently visible messages
        $element.on('$destroy', function() {
          forEach(messages, function(item) {
            item.message.detach();
          });
        });

        this.reRender = function() {
          if (!renderLater) {
            renderLater = true;
            $scope.$evalAsync(function() {
              if (renderLater && cachedCollection) {
                ctrl.render(cachedCollection);
              }
            });
          }
        };

        this.register = function(comment, messageCtrl) {
          var nextKey = latestKey.toString();
          messages[nextKey] = {
            message: messageCtrl
          };
          insertMessageNode($element[0], comment, nextKey);
          comment.$$ngMessageNode = nextKey;
          latestKey++;

          ctrl.reRender();
        };

        this.deregister = function(comment) {
          var key = comment.$$ngMessageNode;
          delete comment.$$ngMessageNode;
          removeMessageNode($element[0], comment, key);
          delete messages[key];
          ctrl.reRender();
        };

        function findPreviousMessage(parent, comment) {
          var prevNode = comment;
          var parentLookup = [];

          while (prevNode && prevNode !== parent) {
            var prevKey = prevNode.$$ngMessageNode;
            if (prevKey && prevKey.length) {
              return messages[prevKey];
            }

            // dive deeper into the DOM and examine its children for any ngMessage
            // comments that may be in an element that appears deeper in the list
            if (prevNode.childNodes.length && parentLookup.indexOf(prevNode) === -1) {
              parentLookup.push(prevNode);
              prevNode = prevNode.childNodes[prevNode.childNodes.length - 1];
            } else if (prevNode.previousSibling) {
              prevNode = prevNode.previousSibling;
            } else {
              prevNode = prevNode.parentNode;
              parentLookup.push(prevNode);
            }
          }
        }

        function insertMessageNode(parent, comment, key) {
          var messageNode = messages[key];
          if (!ctrl.head) {
            ctrl.head = messageNode;
          } else {
            var match = findPreviousMessage(parent, comment);
            if (match) {
              messageNode.next = match.next;
              match.next = messageNode;
            } else {
              messageNode.next = ctrl.head;
              ctrl.head = messageNode;
            }
          }
        }

        function removeMessageNode(parent, comment, key) {
          var messageNode = messages[key];

          var match = findPreviousMessage(parent, comment);
          if (match) {
            match.next = messageNode.next;
          } else {
            ctrl.head = messageNode.next;
          }
        }
      }]
    };

    function isAttrTruthy(scope, attr) {
     return (isString(attr) && attr.length === 0) || //empty attribute
            truthy(scope.$eval(attr));
    }

    function truthy(val) {
      return isString(val) ? val.length : !!val;
    }
  }])

  .directive('ngMessagesInclude',
    ['$templateRequest', '$document', '$compile', function($templateRequest, $document, $compile) {

    return {
      restrict: 'AE',
      require: '^^ngMessages', // we only require this for validation sake
      link: function($scope, element, attrs) {
        var src = attrs.ngMessagesInclude || attrs.src;
        $templateRequest(src).then(function(html) {
          if ($scope.$$destroyed) return;

          if (isString(html) && !html.trim()) {
            // Empty template - nothing to compile
            replaceElementWithMarker(element, src);
          } else {
            // Non-empty template - compile and link
            $compile(html)($scope, function(contents) {
              element.after(contents);
              replaceElementWithMarker(element, src);
            });
          }
        });
      }
    };

    // Helpers
    function replaceElementWithMarker(element, src) {
      // A comment marker is placed for debugging purposes
      var comment = $compile.$$createComment ?
          $compile.$$createComment('ngMessagesInclude', src) :
          $document[0].createComment(' ngMessagesInclude: ' + src + ' ');
      var marker = jqLite(comment);
      element.after(marker);

      // Don't pollute the DOM anymore by keeping an empty directive element
      element.remove();
    }
  }])

  .directive('ngMessage', ngMessageDirectiveFactory())


  .directive('ngMessageExp', ngMessageDirectiveFactory());

function ngMessageDirectiveFactory() {
  return ['$animate', function($animate) {
    return {
      restrict: 'AE',
      transclude: 'element',
      priority: 1, // must run before ngBind, otherwise the text is set on the comment
      terminal: true,
      require: '^^ngMessages',
      link: function(scope, element, attrs, ngMessagesCtrl, $transclude) {
        var commentNode = element[0];

        var records;
        var staticExp = attrs.ngMessage || attrs.when;
        var dynamicExp = attrs.ngMessageExp || attrs.whenExp;
        var assignRecords = function(items) {
          records = items
              ? (isArray(items)
                  ? items
                  : items.split(/[\s,]+/))
              : null;
          ngMessagesCtrl.reRender();
        };

        if (dynamicExp) {
          assignRecords(scope.$eval(dynamicExp));
          scope.$watchCollection(dynamicExp, assignRecords);
        } else {
          assignRecords(staticExp);
        }

        var currentElement, messageCtrl;
        ngMessagesCtrl.register(commentNode, messageCtrl = {
          test: function(name) {
            return contains(records, name);
          },
          attach: function() {
            if (!currentElement) {
              $transclude(function(elm, newScope) {
                $animate.enter(elm, null, element);
                currentElement = elm;

                // Each time we attach this node to a message we get a new id that we can match
                // when we are destroying the node later.
                var $$attachId = currentElement.$$attachId = ngMessagesCtrl.getAttachId();

                // in the event that the element or a parent element is destroyed
                // by another structural directive then it's time
                // to deregister the message from the controller
                currentElement.on('$destroy', function() {
                  if (currentElement && currentElement.$$attachId === $$attachId) {
                    ngMessagesCtrl.deregister(commentNode);
                    messageCtrl.detach();
                  }
                  newScope.$destroy();
                });
              });
            }
          },
          detach: function() {
            if (currentElement) {
              var elm = currentElement;
              currentElement = null;
              $animate.leave(elm);
            }
          }
        });
      }
    };
  }];

  function contains(collection, key) {
    if (collection) {
      return isArray(collection)
          ? collection.indexOf(key) >= 0
          : collection.hasOwnProperty(key);
    }
  }
}


})(window, window.angular);
