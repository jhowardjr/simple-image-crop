/*jslint browser: true */
/*global angular */
/*jslint white: true */
/*jslint plusplus: true */
angular.module('ngSimpleImageCrop', [])
    .directive('simpleCrop', function($http) {
        'use strict';
        var getElementById = function(id) {
            return document.getElementById(id);
        };

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

                var maxpreviewimagewidth = attrs.maxpreviewimagewidth || scope.maxpreviewimagewidth,
                    maxpreviewimageheight = attrs.maxpreviewimageheight || scope.maxpreviewimageheight,
                    newimageheight = attrs.newimageheight || scope.newimageheight,
                    newimagewidth = attrs.newimagewidth || scope.newimagewidth,
                    imagedestination = attrs.imagedestination || scope.imagedestination,
                    phpscriptlocation = attrs.phpscriptlocation || scope.phpscriptlocation,
                    successmessage = attrs.successmessage || scope.successmessage,
                    warningmessage = attrs.warningmessage || scope.warningmessage,
                    image = getElementById('image_to_crop'),
                    cropArea = getElementById('crop_box'),
                    resize = getElementById('resize_icon'),
                    cropPreview = getElementById('crop_preview'),
                    imagePath = image.src,
                    imageHeight = image.height,
                    imageWidth = image.width,
                    resizeState = false,
                    mouseMoveState = false,
                    aspectRatio = imageWidth / imageHeight,
                    previewImageWidth = maxpreviewimagewidth,
                    previewImageHeight = previewImageWidth / aspectRatio,
                    dimensionsDifferenceHeight,
                    dimensionsDifferenceWidth,
                    cropAspectRatio = newimagewidth / newimageheight,
                    initialCropBoxWidth = 400,
                    initialCropBoxHeight = 400 / cropAspectRatio,
                    resizeClickPositionX = 0,
                    offsetLeft,
                    offsetTop,
                    initialCropBoxPositionX,
                    initialCropBoxPositionY,
                    moveRight,
                    moveDown,
                    resizeHorizontal,
                    resizeVertical,
                    x,
                    y,
                    w,
                    h,
                    data,
                    json;


                getElementById('crop_container').className = '';
                getElementById('crop_preview').className = '';

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

                getElementById('image_preview').addEventListener('dragstart', function(event) {
                    event.preventDefault();
                });

                getElementById('image_preview').src = imagePath;

                cropPreview.style.width = newimagewidth + 'px';
                cropPreview.style.height = newimageheight + 'px';

                dimensionsDifferenceHeight = imageHeight / previewImageHeight;
                dimensionsDifferenceWidth = imageWidth / previewImageWidth;

                getElementById('crop_container').style.width = previewImageWidth + 'px';
                getElementById('crop_container').style.height = previewImageHeight + 42 + 'px';

                cropArea.style.width = initialCropBoxWidth + 'px';
                cropArea.style.height = initialCropBoxHeight + 'px';

                getElementById('image_preview').style.width = (newimagewidth / initialCropBoxWidth * previewImageWidth) + 'px';
                getElementById('image_preview').style.height = (newimageheight / initialCropBoxHeight * previewImageHeight) + 'px';

                getElementById('image_preview').style.marginLeft = ((-parseFloat(cropArea.style.left, 10)) * (parseFloat(getElementById('image_preview').style.width, 10) / previewImageWidth)) + 'px';
                getElementById('image_preview').style.marginTop = ((-parseFloat(cropArea.style.top, 10)) * (parseFloat(getElementById('image_preview').style.height, 10) / previewImageHeight)) + 'px';

                cropArea.style.left = '10px';
                cropArea.style.top = '10px';

                cropArea.addEventListener('mousedown', function(a) {

                    initialCropBoxPositionX = a.pageX;
                    initialCropBoxPositionY = a.pageY;
                    if (a.originalEvent) {
                        a.originalEvent.preventDefault();
                    }

                    offsetLeft = parseFloat(cropArea.style.left, 10);
                    offsetTop = parseFloat(cropArea.style.top, 10);
                    mouseMoveState = true;

                });

                document.addEventListener('mousemove', function(e) {
                    if (mouseMoveState) {

                        moveRight = offsetLeft + (e.pageX - initialCropBoxPositionX);
                        moveDown = offsetTop + (e.pageY - initialCropBoxPositionY);

                        if (((previewImageHeight - parseFloat(cropArea.style.height, 10)) > moveDown) && (moveDown > 0)) {
                            cropArea.style.top = moveDown + 'px';
                            getElementById('image_preview').style.marginTop = ((-moveDown) * (parseFloat(getElementById('image_preview').style.height, 10) / previewImageHeight)) + 'px';

                        }

                        if (((previewImageWidth - parseFloat(cropArea.style.width, 10)) > moveRight) && (moveRight > 0)) {
                            cropArea.style.left = moveRight + 'px';
                            getElementById('image_preview').style.marginLeft = ((-moveRight) * (parseFloat(getElementById('image_preview').style.width, 10) / previewImageWidth)) + 'px';
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

                    getElementById('crop_container').style.cursor = 'se-resize';
                    cropArea.style.cursor = 'se-resize';
                    return false;

                });

                document.addEventListener('mousemove', function(f) {
                    if (resizeState) {
                        resizeHorizontal = initialCropBoxWidth + (f.pageX - resizeClickPositionX);
                        resizeVertical = initialCropBoxHeight + (f.pageX - resizeClickPositionX) / cropAspectRatio;

                        if ((parseFloat(cropArea.style.height, 10) + parseFloat(cropArea.style.top, 10) + 2) < previewImageHeight && (parseFloat(cropArea.style.width, 10) + parseFloat(cropArea.style.left, 10) + 2) < previewImageWidth && (parseFloat(cropArea.style.width, 10) > 40 || ((f.pageX - resizeClickPositionX) > 0))) {
                            cropArea.style.height = resizeVertical + 'px';
                            cropArea.style.width = resizeHorizontal + 'px';

                            getElementById('image_preview').style.width = newimagewidth / resizeHorizontal * previewImageWidth + 'px';
                            getElementById('image_preview').style.height = newimageheight / resizeVertical * previewImageHeight + 'px';
                            getElementById('image_preview').style.marginLeft = ((-parseFloat(cropArea.style.left, 10)) * (parseFloat(getElementById('image_preview').style.width, 10) / previewImageWidth)) + 'px';
                            getElementById('image_preview').style.marginTop = ((-parseFloat(cropArea.style.top, 10)) * (parseFloat(getElementById('image_preview').style.height, 10) / previewImageHeight)) + 'px';

                        } else if ((f.pageX - resizeClickPositionX) < 0 && parseFloat(cropArea.style.width, 10) > 40) {
                            cropArea.style.height = resizeVertical + 'px';
                            cropArea.style.width = resizeHorizontal + 'px';

                            getElementById('image_preview').style.width = newimagewidth / resizeHorizontal * previewImageWidth + 'px';
                            getElementById('image_preview').style.height = newimageheight / resizeVertical * previewImageHeight + 'px';
                            getElementById('image_preview').style.marginLeft = ((-parseFloat(cropArea.style.left, 10)) * (parseFloat(getElementById('image_preview').style.width, 10) / previewImageWidth)) + 'px';
                            getElementById('image_preview').style.marginTop = ((-parseFloat(cropArea.style.top, 10)) * (parseFloat(getElementById('image_preview').style.height, 10) / previewImageHeight)) + 'px';

                        }

                        if ((parseFloat(cropArea.style.height, 10) * dimensionsDifferenceHeight) < newimageheight || (parseFloat(cropArea.style.width, 10) * dimensionsDifferenceWidth) < newimagewidth) {
                            cropArea.style.backgroundColor = '#DB2C2C';
                            cropArea.style.borderColor = '#FFFFFF';
                            getElementById('crop_message').innerHTML = warningmessage;
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

                    x = parseFloat(cropArea.style.left, 10) * dimensionsDifferenceWidth; // x-coordinate of the crop selection
                    y = parseFloat(cropArea.style.top, 10) * dimensionsDifferenceHeight; // y-coordinate of the crop selection
                    w = parseFloat(cropArea.style.width, 10) * dimensionsDifferenceWidth; // width of the crop selection
                    h = parseFloat(cropArea.style.height, 10) * dimensionsDifferenceHeight; // height of the crop selestion

                    data = {
                        x: x,
                        y: y,
                        w: w,
                        h: h,
                        dimension_x: newimagewidth,
                        dimension_y: newimageheight,
                        image_path: imagePath,
                        image_destination: imagedestination
                    };
                    json = JSON.stringify(data);
                    $http.post(phpscriptlocation, json).success(function() {
                        getElementById('crop_message').innerHTML = successmessage;
                        getElementById('crop_message').style.visibility = 'visible';
                    });

                });
            }
        };
    });
