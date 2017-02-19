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
	}).when('/manage', {
		templateUrl: 'manage.html',
		controller: 'ManageCtrl'
	}).otherwise({
		redirectTo: '/main'
	})
}])

.controller('MainCtrl', ['$scope', '$firebaseStorage', '$firebaseArray', function($scope, $firebaseStorage, $firebaseArray){
	var uploadbar = document.getElementById('uploadbar');
	$scope.topics = {};
	$scope.selectMsg = true;

	$scope.selectFile = function(files){
		$scope.fileList = files;
		// console.log($scope.fileList);
		$scope.selectMsg = false;
	};

	// Remove file from list
	$scope.removeFile = function(file){
		var index = $scope.fileList.indexOf(file);
		$scope.fileList.splice(index, 1);
		if($scope.fileList.length < 1) {
			$scope.selectMsg = true;
		}
	}

	$scope.uploadFile = function(file){
		var file = file;
		var tags = $scope.topics.tag;
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
				url: imageUrl,
				tags: tags
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

.controller('ManageCtrl', ['$scope', '$firebaseArray', '$firebaseStorage', function($scope, $firebaseArray, $firebaseStorage){
	var ref = firebase.database().ref("ImageUrls");
	var urls = $firebaseArray(ref);
	$scope.urls = urls;

	$scope.deleteFile = function(url){
		// Get file refferance
		var storageRef = firebase.storage().ref('Photos/' + url.name);
		var storage = $firebaseStorage(storageRef);
		// Delet file
		storage.$delete().then(function(){
			$scope.urls.$remove(url);
			console.log("Successfully deleted file");
		});
	};
}])