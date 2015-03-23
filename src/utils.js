function applyHeight(elt, height) {
	if (!elt.length) {
		return ;
	}
	if (height) {
		console.log('in');
		!angular.isUndefined(height.maxHeight) && elt.css('max-height', height.maxHeight + 'px');
		!angular.isUndefined(height.minHeight) && elt.css('min-height', height.minHeight + 'px');
		angular.forEach(elt, function(e){
			if (!angular.isUndefined(height.height) && !angular.element(e).data('jlo-chatbar-chat-resized')) {
				angular.element(e).css('height', height.height + 'px');
			}
		});
		/*angular.forEach(elt, function(e) {
			var styles,
				openElt = angular.element(e).find('jlo-chatbar-open')
			;

			if (!openElt.length) {
				return ;
			}

			styles = document.defaultView.getComputedStyle(e);
			openElt
			.css('max-height', styles.maxHeight)
			.css('min-height', styles.minHeight)
			.css('height', styles.height);
		});*/
	}
}

function initResizer(resizerElt, chatElt) {
	var startX, startY, startWidth, startHeight
	;
	
	resizerElt.on('mousedown', initDrag);
	
	function doDrag(e) {
		chatElt.css('height', (startHeight + startY - e.clientY) + 'px');
	}
	
	function stopDrag(e) {
		angular.element(document.body)
		.removeClass('jlo-chatbar-noselect');
		angular.element(document)
		.off('mousemove', doDrag)
		.off('mouseup', stopDrag);
	}
	
	function initDrag(e) {
		chatElt.data('jlo-chatbar-chat-resized', true);
		
		startY = e.clientY;
		startHeight = parseInt(document.defaultView.getComputedStyle(chatElt[0]).height, 10);
		
		angular.element(document.body)
		.addClass('jlo-chatbar-noselect');
		angular.element(document)
		.on('mousemove', doDrag)
		.on('mouseup', stopDrag);
	}
}

export {applyHeight, initResizer};
