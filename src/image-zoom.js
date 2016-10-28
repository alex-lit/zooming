+function() {

  function ImageZoomService() {
    this._scaleBase = 1.0
    this._image = null
    this._overlay = null
    this._window = window
    this._document = document
    this._body = document.body
  }

  ImageZoomService.prototype = {
    init: function() {
      this._body.addEventListener('click', this._handleClick.bind(this))
      this._overlay = new Overlay()
    },

    _handleClick: function(event) {
      var target = event.target

      if (!target) return

      if (target.tagName === 'IMG' && target.hasAttribute('data-action')) {
        this._image = new Zoomable(target)

        var action = target.getAttribute('data-action')

        switch (action) {
          case 'zoom':
            this._zoom()
            break;
          case 'close':
            this._close()
            break;
          default:
            break;
        }
      } else {
        this._close()
      }
    },

    _handleKeyDown: function(event) {
      // Esc => close zoom
      if (event.keyCode === 27) this._close()
    },

    _zoom: function() {
      this._calculateZoom((function(translate, scale) {
        this._image.zoomIn(translate, scale)
      }).bind(this))

      this._overlay.show()
      this._document.addEventListener('keydown', this._handleKeyDown.bind(this))
    },

    _calculateZoom: function(callback) {
      var imgRect = this._image.getRect()

      var centerX = this._window.innerWidth / 2
      var centerY = this._window.innerHeight / 2

      var imgRectHalfWidth = imgRect.width / 2
      var imgRectHalfHeight = imgRect.height / 2

      var imgX = imgRect.left + imgRectHalfWidth
      var imgY = imgRect.top + imgRectHalfHeight

      var translate = {
        x: centerX - imgX,
        y: centerY - imgY
      }

      var distX = centerX - imgRectHalfWidth
      var distY = centerY - imgRectHalfHeight

      var scale = this._scaleBase + Math.min(distX / imgRectHalfWidth, distY / imgRectHalfHeight)

      callback(translate, scale)
    },

    _close: function() {
      if (!this._image) return

      this._overlay.hide()
      this._image.zoomOut()
      this._document.removeEventListener('keydown', this._handleKeyDown.bind(this))
      this._image = null
    }
  }

  /**
   * The overlay that hide/show DOM body.
   */
  function Overlay() {
    this._body = document.body
    this._element = document.createElement('div')
    this._element.classList.add('image-zoom-overlay')
  }

  Overlay.prototype = {
    show: function() {
      this._body.classList.add('image-zoom-overlay-show')
      this._body.appendChild(this._element)
    },

    hide: function() {
      this._body.classList.remove('image-zoom-overlay-show')
      this._body.removeChild(this._element)
    }
  }

  /**
   * The target image.
   */
  function Zoomable(img) {
    this._target = img
    this._rect = this._target.getBoundingClientRect()
    this._body = document.body
  }

  Zoomable.prototype = {
    zoomIn: function(translate, scale) {
      this._target.setAttribute('data-action', 'close')
      this._target.classList.add('image-zoom-transition', 'image-zoom-img')

      var transform = 'translate(' + translate.x + 'px,' + translate.y + 'px) ' +
      'scale(' + scale + ',' + scale + ')'

      setStyles(this._target, {
        '-webkit-transform': transform,
        '-ms-transform': transform,
        'transform': transform,
      })
    },

    zoomOut: function() {
      this._target.setAttribute('data-action', 'zoom')
      this._target.classList.remove('image-zoom-img')

      setStyles(this._target, {
        '-webkit-transform': '',
        '-ms-transform': '',
        'transform': '',
      })

      this._target = null
    },

    getRect: function() {
      return this._rect
    }
  }

  /**
   * Set css styles.
   */
  function setStyles(element, styles) {
    for (var prop in styles) {
      element.style[prop] = styles[prop]
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    new ImageZoomService().init()
  })
}()
