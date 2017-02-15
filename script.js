angular.module('photoUpload', [
	'ngRoute',
	'ngFileUpload',
	'firebase'
])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/main', {
		templateUrl: 'main.html',
		controller: 'MainCtrl'
	}).when('/gallery', {
		templateUrl: 'gallery.html',
		controller: 'GalleryCtrl'
	}).otherwise({
		redirectTo: '/main'
	})
}])

.controller('MainCtrl', ['$scope', '$firebaseStorage', '$firebaseArray', function($scope, $firebaseStorage, $firebaseArray){
	var uploadbar = document.getElementById('uploadbar');
	$scope.selectFile = function(files){
		var file = files[0];
		// console.log(file);
		// Create firebase storage referrence
		var storageRef = firebase.storage().ref('Photos/'+ file.name);
		var storage = $firebaseStorage(storageRef);
		// Upload file
		var uploadTask = storage.$put(file);
		// Update Progress bar
		uploadTask.$progress(function(snapshot){
			var percentUploaded = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  			$scope.percentage = percentUploaded.toFixed(0);
  			uploadbar.style.width = $scope.percentage + "%";
		});
		// Get Download URL
		uploadTask.$complete(function(snapshot){
			var imageUrl = snapshot.downloadURL;
			var imageName = snapshot.metadata.name;
			// console.log($scope.imageName + '-' + $scope.imageUrl);
			var ref = firebase.database().ref("ImageUrls");
			var urls = $firebaseArray(ref);
			urls.$add({
				name: imageName,
				url: imageUrl
			}).then(function(ref){
				var id = ref.key;
				console.log("Added image url to database with id = " + id);
				urls.$indexFor(id);
			});
		});
		// Error while uploading
		uploadTask.$error(function(error){
			console.log(error);
		});

	};

}])

.controller('GalleryCtrl', ['$scope', '$firebaseArray', function($scope, $firebaseArray){
	var ref = firebase.database().ref("ImageUrls");
	var urls = $firebaseArray(ref);
	$scope.urls = urls;
}])