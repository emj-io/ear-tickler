var React             = require('react');
var Fluxxor           = require('fluxxor');
var _ = window._      = require('lodash');

var FilteredTrackList = require('../components/navigation/FilteredTrackList.js');
var Oscilloscope      = require('../components/visualization/Oscilloscope.js');
var SoundBoard        = require('../components/soundboard/SoundBoard.js');
var Visualizer        = require('../components/visualization/Visualizer.js');

var Guid              = require('../helpers/Guid.js');
var XHR               = require('../helpers/XHR.js');

module.exports = React.createClass({
  mixins: [
    Fluxxor.FluxMixin(React),
    Fluxxor.StoreWatchMixin('TrackStore', 'PlayerStore', 'VisualizerStore')
  ],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      tracks:      flux.store('TrackStore').tracks,
      players:     flux.store('PlayerStore').players,
      visualizers: flux.store('VisualizerStore').visualizers
    };
  },

  handleAddAudioPlayer: function(track_id) {
    this.getFlux().actions.addPlayer(this.state.tracks[track_id]);
  },
  handleCloseAudioPlayer: function(player_id) {
    this.getFlux().actions.removePlayer(player_id);
  },
  handleRemoveTrack: function(track_id) {
    this.getFlux().actions.removeTrack(track_id);
  },
  handleUpdateTrack: function(track) {
    this.getFlux().actions.updateTrack(track);
  },

  _as_array: function(state_object) {
    return Object.keys(this.state[state_object]).map(function(key) {
      return this.state[state_object][key]
    }.bind(this));
  },

  render: function() {
    var addedTrackIds = Object.keys(this.state.tracks);

    return(
      <div className="ear-tickler application">
        <div className="header-bar">
          <div className="title">
            <i className="tickle-logo"></i> Ear Tickler
          </div>
          <Visualizer
            players={this._as_array('players')}
            visualizers={this._as_array('visualizers')}
          />
          <div className="social-media">
            <a href="https://github.com/troyalford/ear-tickler" target="_blank">
              <i className="tickle-github"></i>
            </a>
          </div>
        </div>
        <FilteredTrackList
          tracks={this._as_array('tracks')}
          addedTrackIds={addedTrackIds}
          onPlayTrack={this.handleAddAudioPlayer}
          onRemoveTrack={this.handleRemoveTrack}
          onUpdateTrack={this.handleUpdateTrack}
        />
        <SoundBoard
          players={this._as_array('players')}
          onCloseClicked={this.handleCloseAudioPlayer}
        />
      </div>
    );
  }
});
