angular.module('ngSimpleImageCrop', [])
    .directive('simpleCrop', function($http) {
        var getElementById = function(id) {
            return document.getElementById(id);
        }
        return {
            restrict: 'E',
            scope: {
                maxPreviewImageWidth: '=?',
                maxPreviewImageHeight: '=?',
                newImageHeight: '=?',
                newImageWidth: '=?',
                imageDestination: '=?',
                phpScriptLocation: '=?',
                successMessage: '=?',
                warningMessage: '=?'
            },
            controller: function($scope) {

                $scope.maxpreviewimagewidth = $scope.maxpreviewimagewidth || 700;
                $scope.maxpreviewimageheight = $scope.maxpreviewimageheight || 700;
                $scope.newimageheight = $scope.newimageheight || 300;
                $scope.newimagewidth = $scope.newimagewidth || 400;
                $scope.imagedestination = $scope.imagedestination || 'test2.jpg';
                $scope.phpscriptlocation = $scope.phpscriptLocation || 'simpleImageCrop.php';
                $scope.successmessage = $scope.successmessage || 'The image has been cropped!';
                $scope.warningmessage = $scope.warningmessage || 'Warning: Selected area is too small. The image will be blurry.';

            },
            templateUrl: function() {
                return '../views/simple-crop.html';
            },
            link: function(scope, element, attrs) {

                var maxpreviewimagewidth = attrs.maxpreviewimagewidth ? attrs.maxpreviewimagewidth : scope.maxpreviewimagewidth;
                var maxpreviewimageheight = attrs.maxpreviewimageheight ? attrs.maxpreviewimageheight : scope.maxpreviewimageheight;
                var newimageheight = attrs.newimageheight ? attrs.newimageheight : scope.newimageheight;
                var newimagewidth = attrs.newimagewidth ? attrs.newimagewidth : scope.newimagewidth;
                var imagedestination = attrs.imagedestination ? attrs.imagedestination : scope.imagedestination;
                var phpscriptlocation = attrs.phpscriptlocation ? attrs.phpscriptlocation : scope.phpscriptlocation;
                var successmessage = attrs.successmessage ? attrs.successmessage : scope.successmessage;
                var warningmessage = attrs.warningmessage ? attrs.warningmessage : scope.warningmessage;

                angular.element(getElementById('crop_container')).removeClass('hidden');
                angular.element(getElementById('crop_preview')).removeClass('hidden');

                var image = getElementById('image_to_crop');
                var cropArea = getElementById('crop_box');
                var resize = getElementById('resize_icon');
                var cropPreview = getElementById('crop_preview');
                var imagePath = image.src;
                var imageHeight = image.height;
                var imageWidth = image.width;
                var resizeState = false;
                var mouseMoveState = false;
                var aspectRatio = imageWidth / imageHeight;
                var previewImageWidth = maxpreviewimagewidth;
                var previewImageHeight = previewImageWidth / aspectRatio;

                if (previewImageHeight <= maxpreviewimageheight) {
                    image.style.width = previewImageWidth + 'px';
                    image.style.height = previewImageHeight + 'px';
                } else {
                    previewImageHeight = maxpreviewimageheight;
                    previewImageWidth = maxpreviewimageheight * aspectRatio;
                    image.style.width = previewImageWidth + 'px';
                    image.style.height = maxpreviewimageheight + 'px';
                }

                image.addEventListener('dragstart', function(event) {
                    event.preventDefault();
                });

                getElementById('image_preview').addEventListener("dragstart", function(event) {
                    event.preventDefault();
                });

                getElementById('image_preview').src = imagePath;

                cropPreview.style.width = newimagewidth + "px";
                cropPreview.style.height = newimageheight + "px";

                var dimensionsDifferenceHeight = imageHeight / previewImageHeight;
                var dimensionsDifferenceWidth = imageWidth / previewImageWidth;

                getElementById('crop_container').style.width = previewImageWidth + "px";
                getElementById('crop_container').style.height = previewImageHeight + 42 + "px";

                var cropAspectRatio = newimagewidth / newimageheight;
                var initialCropBoxWidth = 400;
                var initialCropBoxHeight = 400 / cropAspectRatio;

                cropArea.style.width = initialCropBoxWidth + "px";
                cropArea.style.height = initialCropBoxHeight + "px";

                getElementById('image_preview').style.width = (newimagewidth / initialCropBoxWidth * previewImageWidth) + "px";
                getElementById('image_preview').style.height = (newimageheight / initialCropBoxHeight * previewImageHeight) + "px";

                getElementById('image_preview').style.marginLeft = ((-parseFloat(cropArea.style.left, 10)) * (parseFloat(getElementById('image_preview').style.width, 10) / previewImageWidth)) + "px";
                getElementById('image_preview').style.marginTop = ((-parseFloat(cropArea.style.top, 10)) * (parseFloat(getElementById('image_preview').style.height, 10) / previewImageHeight)) + "px";

                var resizeClickPositionX = 0;
                var resizeClickPositionY = 0;
                var offsetLeft;
                var offsetTop;
                var initialCropBoxPositionX;
                var initialCropBoxPositionY;

                cropArea.style.left = "10px";
                cropArea.style.top = "10px";

                cropArea.addEventListener("mousedown", function(a) {

                    initialCropBoxPositionX = a.pageX;
                    initialCropBoxPositionY = a.pageY;
                    if (a.originalEvent) {
                        a.originalEvent.preventDefault();
                    }

                    offsetLeft = parseFloat(cropArea.style.left, 10);
                    offsetTop = parseFloat(cropArea.style.top, 10);
                    mouseMoveState = true;

                });

                document.addEventListener("mousemove", function(e) {
                    if (mouseMoveState) {

                        var moveRight = offsetLeft + (e.pageX - initialCropBoxPositionX);
                        var moveDown = offsetTop + (e.pageY - initialCropBoxPositionY);

                        if (((previewImageHeight - parseFloat(cropArea.style.height, 10)) > moveDown) && (moveDown > 0)) {
                            cropArea.style.top = moveDown + "px";
                            getElementById('image_preview').style.marginTop = ((-moveDown) * (parseFloat(getElementById('image_preview').style.height, 10) / previewImageHeight)) + "px";

                        }

                        if (((previewImageWidth - parseFloat(cropArea.style.width, 10)) > moveRight) && (moveRight > 0)) {
                            cropArea.style.left = moveRight + "px";
                            getElementById('image_preview').style.marginLeft = ((-moveRight) * (parseFloat(getElementById('image_preview').style.width, 10) / previewImageWidth)) + "px";
                        }
                    }
                });

                document.addEventListener('mouseup', function() {
                    if (mouseMoveState) {
                        cropArea.onmousemove = null;
                        mouseMoveState = false;
                    }
                });

                resize.addEventListener('mousedown', function(b) {

                    resizeState = true;

                    initialCropBoxHeight = parseFloat(cropArea.style.height, 10);
                    initialCropBoxWidth = parseFloat(cropArea.style.width, 10);
                    resizeClickPositionX = b.pageX;
                    resizeClickPositionY = b.pageY;

                    getElementById('crop_container').style.cursor = 'se-resize';
                    cropArea.style.cursor = 'se-resize';
                    return false;

                });

                document.addEventListener('mousemove', function(f) {
                    if (resizeState) {
                        var resizeHorizontal = initialCropBoxWidth + (f.pageX - resizeClickPositionX);
                        var resizeVertical = initialCropBoxHeight + (f.pageX - resizeClickPositionX) / cropAspectRatio;

                        if ((parseFloat(cropArea.style.height, 10) + parseFloat(cropArea.style.top, 10) + 2) < previewImageHeight && (parseFloat(cropArea.style.width, 10) + parseFloat(cropArea.style.left, 10) + 2) < previewImageWidth && (parseFloat(cropArea.style.width, 10) > 40 || ((f.pageX - resizeClickPositionX) > 0))) {
                            cropArea.style.height = resizeVertical + "px";
                            cropArea.style.width = resizeHorizontal + "px";

                            getElementById('image_preview').style.width = newimagewidth / resizeHorizontal * previewImageWidth + "px";
                            getElementById('image_preview').style.height = newimageheight / resizeVertical * previewImageHeight + "px";
                            getElementById('image_preview').style.marginLeft = ((-parseFloat(cropArea.style.left, 10)) * (parseFloat(getElementById('image_preview').style.width, 10) / previewImageWidth)) + "px";
                            getElementById('image_preview').style.marginTop = ((-parseFloat(cropArea.style.top, 10)) * (parseFloat(getElementById('image_preview').style.height, 10) / previewImageHeight)) + "px";

                        } else if ((f.pageX - resizeClickPositionX) < 0 && parseFloat(cropArea.style.width, 10) > 40) {
                            cropArea.style.height = resizeVertical + "px";
                            cropArea.style.width = resizeHorizontal + "px";

                            getElementById('image_preview').style.width = newimagewidth / resizeHorizontal * previewImageWidth + "px";
                            getElementById('image_preview').style.height = newimageheight / resizeVertical * previewImageHeight + "px";
                            getElementById('image_preview').style.marginLeft = ((-parseFloat(cropArea.style.left, 10)) * (parseFloat(getElementById('image_preview').style.width, 10) / previewImageWidth)) + "px";
                            getElementById('image_preview').style.marginTop = ((-parseFloat(cropArea.style.top, 10)) * (parseFloat(getElementById('image_preview').style.height, 10) / previewImageHeight)) + "px";

                        }

                        if ((parseFloat(cropArea.style.height, 10) * dimensionsDifferenceHeight) < newimageheight || (parseFloat(cropArea.style.width, 10) * dimensionsDifferenceWidth) < newimagewidth) {
                            cropArea.style.backgroundColor = "#DB2C2C";
                            cropArea.style.borderColor = "#FFFFFF";
                            getElementById('crop_message').html = warningmessage;
                            getElementById('crop_message').style.visibility = 'visible';
                        } else {
                            cropArea.style.backgroundColor = '#FFFFFF';
                            cropArea.style.borderColor = '#186ab5';
                            getElementById('crop_message').style.visibility = 'hidden';

                        }
                    }

                });

                document.addEventListener('mouseup', function() {

                    if (resizeState) {
                        resizeState = false;
                        getElementById('crop_container').style.cursor = 'auto';
                        cropArea.style.cursor = 'move';
                    }
                });

                getElementById('crop_button').addEventListener('click', function() {

                    var x = parseFloat(cropArea.style.left, 10) * dimensionsDifferenceWidth; // x-coordinate of the crop selection
                    var y = parseFloat(cropArea.style.top, 10) * dimensionsDifferenceHeight; // y-coordinate of the crop selection
                    var w = parseFloat(cropArea.style.width, 10) * dimensionsDifferenceWidth; // width of the crop selection
                    var h = parseFloat(cropArea.style.height, 10) * dimensionsDifferenceHeight; // height of the crop selestion

                    var data = {
                        x: x,
                        y: y,
                        w: w,
                        h: h,
                        dimension_x: newimagewidth,
                        dimension_y: newimageheight,
                        image_path: imagePath,
                        image_destination: imagedestination
                    };
                    var json = JSON.stringify(data);
                    $http.post(phpscriptlocation, json).success(function(data) {
                        getElementById('crop_message').html = successmessage;
                        getElementById('crop_message').style.visibility = 'visible';
                    });

                });
            }
        };
    });
