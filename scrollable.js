;
(function (angular, $, undefined) {
  'use strict';
  if ($.fn.nanoScroller === undefined)
    throw new Error("nanoScrollerJS is not defined in jQuery");
  //jQuery must be used, cause angular method 'find' has different behavior
  if (angular.element !== $)
    throw new Error("Angular must use jQuery not jqLite");

  var AS_ELEMENT = true, AS_ATTRIBUTE = false;
  angular.module('sun.scrollable', ['ng'])
    .constant("scrollableDefaults", {
      template: '<div class="nano"><div class="content" ng-transclude></div></div>',
      bottomMargin: 40
    })
    .constant("nanoScrollerDefaults", {
    })
    .directive("scrollable", createScrollableDirective(AS_ELEMENT))
    .directive("scrollable", createScrollableDirective(AS_ATTRIBUTE));

  function createScrollableDirective(type) {
    return ['$timeout', 'scrollableDefaults', 'nanoScrollerDefaults',
      function ($timeout, scrollableDefaults, nanoScrollerDefaults) {
        return {
          transclude: true,
          replace: type === AS_ELEMENT,
          restrict: type === AS_ELEMENT ? 'E' : 'A',
          priority: 1000,
          template: scrollableDefaults.template,
          link: function (scope, element, attr) {
            var contentElement = element.find('.content')[0],
            // Find element with nano class including current
              nanoElement = element.hasClass('nano') ? element : element.find('.nano'),
              options = type === AS_ELEMENT ? convertStringToValue(attr) : scope.$eval(attr['scrollable']),
              parentElement = contentElement.parentElement;
            options = angular.extend({}, nanoScrollerDefaults, options);
            if ('static' in attr) {
              // Call scroller after transclusion
              $timeout(nanoElement.nanoScroller.bind(nanoElement, options));
            }
            else {
              scope.$watch( // Call nanoScroller, when height of content is changed
                function () {
                  return contentElement.scrollHeight;
                },
                function (newHeight, oldHeight) {
                  if (newHeight === oldHeight) {
                    nanoElement.nanoScroller(options)
                  }
                  else if (newHeight !== oldHeight && contentElement.scrollTop &&
                    (oldHeight - contentElement.scrollTop - parentElement.clientHeight) < scrollableDefaults.bottomMargin) {
                    nanoElement.nanoScroller({scroll: 'bottom'});
                  }
                  else {
                    nanoElement.nanoScroller();
                  }
                });
            }
            scope.$on("$destroy", function () {
              nanoElement.nanoScroller({ destroy: true });
            })
          }
        };
      }]
  }

  function convertStringToValue(attr) {
    var res = {};
    angular.forEach(attr, function (value, key) {
      if (key.indexOf("$") === 0)
        return
      switch (key) {
        case "true":
          value = true;
          break;
        case "false":
          value = false;
          break;
        case "null":
          value = null;
          break;
        case "class":
          return;
      }
      res[key] = value;
    });
    return res
  }
}(angular, jQuery));