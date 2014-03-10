;(function (angular, $, undefined) {
  'use strict';
  if ($.fn['nanoScroller'] === undefined)
    throw new Error("nanoScrollerJS is not defined in jQuery");
  //jQuery must be used, cause angular method 'find' has different behavior
  if (angular.element !== $)
    throw new Error("Angular must use jQuery not jqLite");

  var AS_ELEMENT = 1, AS_ATTRIBUTE = 0;
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
   */
  module.constant("scrollableConfig", {
    template: '<div class="{nanoClass}"><div class="{contentClass}" ng-transclude></div></div>',
    bottomMargin: 40
  });

  /**
   * Default configuration of the nanoScroller
   * @name nanoScrollerDefaults
   */
  module.constant("nanoScrollerDefaults", {
    nanoClass: 'nano',
    contentClass: 'nano-content'
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
        template: format(scrollableConfig.template, nanoScrollerDefaults),
        link: function (scope, element, attr) {
          var oldHeight,
            timerCancelCollection = angular.noop,
            timerCancelStatic = angular.noop,
            contentClass = nanoScrollerDefaults.contentClass,
            nanoClass = nanoScrollerDefaults.nanoClass,
            contentElement = element.find('.' + contentClass)[0],
            parentElement = contentElement.parentElement,
            $nanoElement = element.hasClass(nanoClass) ? element : element.find('.' + nanoClass),
            options = angular.extend({}, nanoScrollerDefaults, convertStringToValue(attr), scope.$eval(attr['scrollable']));

          function listener(newHeight, oldHeight) {
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
          }

          function collectionListener() {
            var newHeight = contentElement.scrollHeight;
            if (oldHeight === undefined) {
              oldHeight = newHeight;
            }
            // Execution of listener must be delayed, because DOM update will be later
            timerCancelCollection = $timeout(listener.bind(listener, newHeight, oldHeight));
          }

          if ('static' in attr) {
            // Call scroller after transclusion
            timerCancelStatic = $timeout(listener);
          }
          else if (typeof attr['watch'] === 'string' || attr['watchCollection']) {
            angular.forEach(splitter(attr['watch']), function (v) {
              scope.$watch(v, collectionListener);
            });
            angular.forEach(splitter(attr['watchCollection']), function (v) {
              scope.$watchCollection(v, collectionListener);
            });
          }
          // If no watchers are supplied fall back to content element height check
          else {
            // http://jsperf.com/angular-watch-collection-vs-element-scroll-height
            // Call nanoScroller, when height of content is changed
            scope.$watch(function () {
                return contentElement.scrollHeight;
              },
              listener);
          }
          scope.$on("$destroy", function () {
            $nanoElement.nanoScroller({ destroy: true });
            $nanoElement = contentElement = parentElement = null;
            timerCancelCollection();
            timerCancelStatic();
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

  /**
   * Split text in attribute by `,` or `;`
   * @param val Attribute value
   * @returns {Array} Array of name
   */
  function splitter(val) {
    if (!val) {
      return [];
    }
    return val.replace(",", ";").split(";");
  }

  /**
   * Format `str` in python way (only dictionary)
   * @param str Input string
   * @param params Replacing variables
   * @returns {String}
   */
  function format(str, params) {
    return str.replace(new RegExp("{.*?}", "g"), function (variable) {
      return params[variable.slice(1, -1)] || "";
    })
  }

}(angular, jQuery));
