(function (angular, $, undefined) {
  'use strict';
  angular.module('app', ['sun.scrollable'])
    .controller('DemoController', function ($scope) {
      var items = $scope.items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      $scope.addItem = function () {
        items.push(items[items.length - 1] + 1);
      }
    })
}(angular, jQuery));