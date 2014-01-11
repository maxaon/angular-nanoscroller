;
(function (angular, $, undefined) {
  'use strict';
  if ($.fn['nanoScroller'] === undefined)
    throw new Error("nanoScrollerJS is not defined in jQuery");
  //jQuery must be used, cause angular method 'find' has different behavior
  if (angular.element !== $)
    throw new Error("Angular must use jQuery not jqLite");

  const AS_ELEMENT = 1, AS_ATTRIBUTE = 0;
  /**
   * Wrapper of nanoScrollerJS
   * @name sun.scrollable
   */
  var module = angular.module('sun.scrollable', ['ng']);

  /**
   * Configuration for the directive
   * @name scrollableConfig
   * @param scrollableConfig.template Template of the scroller
   * @param scrollableConfig.bottomMargin Available number of pixels from the bottom,
   *        in which it is considered that scroller is in bottom
   *
   */
  module.constant("scrollableConfig", {
    template: '<div class="nano"><div class="content" ng-transclude></div></div>',
    bottomMargin: 40
  });

  /**
   * Default configuration of the nanoScroller
   * @name nanoScrollerDefaults
   */
  module.constant("nanoScrollerDefaults", {
  });
  module.directive("scrollable", createScrollableDirective(AS_ELEMENT));
  module.directive("scrollable", createScrollableDirective(AS_ATTRIBUTE));

  /**
   * Create directive 'scrollable' specified by variable `type`.
   * If type equals to `AS_ELEMENT` directive will replace element, otherwise template will be appended.
   * @param type Type of the directive: `AS_ELEMENT` or `AS_ATTRIBUTE`
   * @returns {function} Directive creation function
   */
  function createScrollableDirective(type) {
    var directive = function ($timeout, scrollableConfig, nanoScrollerDefaults) {
      return {
        transclude: true,
        replace: type === AS_ELEMENT,
        restrict: type === AS_ELEMENT ? 'E' : 'A',
        priority: 1000,
        template: scrollableConfig.template,
        link: function (scope, element, attr) {
          var contentElement = element.find('.content')[0],
          // Find element with nano class including current
            $nanoElement = element.hasClass('nano') ? element : element.find('.nano'),
            parentElement = contentElement.parentElement,
            options = angular.extend({}, nanoScrollerDefaults, convertStringToValue(attr), scope.$eval(attr['scrollable']));
          if ('static' in attr) {
            // Call scroller after transclusion
            $timeout($nanoElement.nanoScroller.bind($nanoElement, options));
          }
          else {
            scope.$watch( // Call nanoScroller, when height of content is changed
              function () {
                return contentElement.scrollHeight;
              },
              function (newHeight, oldHeight) {
                // If this is first run, create nanoScroller
                if (newHeight === oldHeight) {
                  $nanoElement.nanoScroller(options)
                }
                //If scroller was on the bottom, scroll to bottom
                else if (newHeight !== oldHeight && contentElement.scrollTop &&
                  (oldHeight - contentElement.scrollTop - parentElement.clientHeight) < scrollableConfig.bottomMargin) {
                  $nanoElement.nanoScroller({scroll: 'bottom'});
                }
                // Otherwise just update the pane
                else {
                  $nanoElement.nanoScroller();
                }
              });
          }
          scope.$on("$destroy", function () {
            $nanoElement.nanoScroller({ destroy: true });
            $nanoElement = contentElement = parentElement = null;
          })
        }
      };
    };
    directive.$inject = ['$timeout', 'scrollableConfig', 'nanoScrollerDefaults'];
    return directive;
  }

  /**
   * Convert element attributes from stings to objects.
   * Also filter attribute (starting from '$' and class)
   * @param attr Attribute array
   * @returns {{}} Filtered object of converted attributes
   */
  function convertStringToValue(attr) {
    var result = {};
    angular.forEach(attr, function (value, key) {
      if (key.indexOf("$") === 0)
        return;
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
      result[key] = value;
    });
    return result
  }

}(angular, jQuery));