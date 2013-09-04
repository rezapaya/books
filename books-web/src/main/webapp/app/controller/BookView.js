'use strict';

/**
 * Book view controller.
 */
App.controller('BookView', function($scope, $q, $timeout, $stateParams, Restangular) {
  // Load book
  var bookPromise = Restangular.one('book', $stateParams.id).get().then(function(data) {
    $scope.book = data;
  })

  // Load tags
  var tagsPromise = Restangular.one('tag/list').get().then(function(data) {
    $scope.tags = data.tags;
  });

  // Wait for everything to load
  $q.all(bookPromise, tagsPromise).then(function() {
    $timeout(function () {
      // Initialize active tags
      _.each($scope.tags, function(tag) {
        var found = _.find($scope.book.tags, function(bookTag) {
          return tag.id == bookTag.id;
        });
        tag.active = found !== undefined;
      });

      // Initialize read state
      $scope.book.read = $scope.book.read_date != null;

      // Watch tags activation
      $scope.$watch('tags', function(prev, next) {
        if (prev !== next) {
          Restangular.one('book', $stateParams.id).post('', {
            tags: _.pluck(_.where($scope.tags, { active: true }), 'id')
          })
        }
      }, true);

      // Watch read state change
      $scope.$watch('book.read', function(prev, next) {
        if (prev !== next) {
          Restangular.one('book', $stateParams.id).post('read', {
            read: $scope.book.read
          }).then(function() {
                if ($scope.book.read) {
                  $scope.book.read_date = new Date().getTime();
                } else {
                  $scope.book.read_date = null;
                }
              });
        }
      }, true);
    }, 1);
  });
});