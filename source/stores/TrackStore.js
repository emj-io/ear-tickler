var Fluxxor = require('fluxxor'),
          _ = require('lodash');

var Guid = require('../helpers/Guid.js'),
     XHR = require('../helpers/XHR.js');

var defaults = {
  track: {
    name: 'Unnamed Track',
    url: ''
  }
};

var messages = {
  AddTrack:    'store.track.add',
  RemoveTrack: 'store.track.delete',
  UpdateTrack: 'store.track.update',

  ClearTracks: 'store.tracks.clear',

  LoadTracks:  'store.track.load-list',
  SaveTracks:  'store.track.save-list'
};

module.exports = Fluxxor.createStore({
  initialize: function() {
    this.tracks = {};
    this.messages = messages;
    this.actions = {
      addTrack: function(track) {
        track = track || {};
        this.dispatch(messages.AddTrack, {
          name: track.name,
          url:  track.url,
          tags: track.tags || []
        });
        this.dispatch(messages.SaveTracks);
      },
      clearTracks: function() {
        this.dispatch(messages.ClearTracks);
      },
      removeTrack: function(id) {
        this.dispatch(messages.RemoveTrack, id);
        this.dispatch(messages.SaveTracks);
      },
      updateTrack: function(track) {
        track = track || {};
        this.dispatch(messages.UpdateTrack, {
          id:   track.id,
          name: track.name,
          url:  track.url,
          tags: track.tags || []
        });
        this.dispatch(messages.SaveTracks);
      },

      loadTracks: function() {
        this.dispatch(messages.LoadTracks);
      },
      saveTracks: function() {
        this.dispatch(messages.SaveTracks);
      }
    };
    Object.keys(this.actions).forEach(function(key) {
      this.actions[key] = this.actions[key].bind(this);
    }.bind(this));

    this.bindActions(
      messages.AddTrack,    this.onAddTrack,
      messages.ClearTracks, this.onClearTracks,
      messages.RemoveTrack, this.onRemoveTrack,
      messages.UpdateTrack, this.onUpdateTrack,

      messages.LoadTracks,  this.onLoadTracks,
      messages.SaveTracks,  this.onSaveTracks
    );

    this.onLoadTracks();
  },
  dispatch: function(type, payload) {
    flux.dispatcher.dispatch({type: type, payload: payload});
  },

  onAddTrack: function(track) {
    track.name = track.name || defaults.track.name;
    track.url = track.url || defaults.track.url;

    track.id = track.id || Guid.generate();
    this.tracks[track.id] = track;
    this.emit('change');
  },
  onClearTracks: function() {
    this.clearing = true;
    Object.keys(this.tracks).forEach(function(key) {
      this.onRemoveTrack(key);
    }.bind(this));
    this.emit('change');
    this.clearing = false;
  },
  onRemoveTrack: function(id) {
    delete this.tracks[id];
    if (!this.clearing) {
      this.emit('change');
    }
  },
  onUpdateTrack: function(track) {
    track.name = track.name || defaults.track.name;
    track.url = track.url || defaults.track.url;
    track.id = track.id || Guid.generate();

    this.tracks[track.id] = track;
    this.emit('change');
  },

  // Loads the user's list of tracks from the API
  // - if unavailable, falls back to LocalStorage
  onLoadTracks: function() {
    this.loading = true;
    if (this.useLocalStorage) {
      this.onClearTracks(); // Clear first.
      JSON.parse(localStorage.getItem('tracks') || '[]').forEach(function(track) {
        this.onAddTrack(track);
      }.bind(this))
    } else {
      XHR.get('/api/tracks', {
        success: function (response) {
          this.onClearTracks(); // Clear first.
          if (!response || !response.message) {
            this.useLocalStorage = true;
            this.onLoadTracks();
          }

          var tracks = JSON.parse(response.message);
          if (tracks && Array.isArray(tracks)) {
            tracks.forEach(function(track) {
              flux.actions.addTrack(track);
            });
          }
        }.bind(this),
        failure: function (response) {
          this.useLocalStorage = true;
          this.onLoadTracks();
        }.bind(this)
      });
    }
    this.loading = false;
  },
  // Persists the user's list of tracks to the API
  // - if unavailable, falls back to LocalStorage
  onSaveTracks: function() {
    var tracks = Object.keys(this.tracks).map(function(key) {
      return this.tracks[key];
    }.bind(this));
    if (this.useLocalStorage) {
      localStorage.setItem('tracks', JSON.stringify(tracks));
    } else {
      XHR.post('/api/tracks', {
        data: tracks
      });
    }
  }
});
