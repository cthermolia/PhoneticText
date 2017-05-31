var textCtrlMod = angular.module( 'textCtrlMod', [ 'textSrvMod' ] );

/*
 * 
 */

textCtrlMod.controller( 'TextCtrl', function ( $scope, $location, TextSrv ) {
    
$scope.text=null;


 $scope.__init__ = function () {
     
     
$scope.text=null;
     
 };
    $scope.phoneticText = function () {
        
     if($scope.text!=null){
                        var myWindow = window.open('https://www.ttsvoice.com/api/speak.php?user=mobics&key=9017baAebv7eaf30cuQ&voice=maria&ln=el&text=' + $scope.text, "TTS", "width=10, height=10");
                        myWindow.blur(); 
                    }
    };
   
    
    
    $scope.__init__();
} );