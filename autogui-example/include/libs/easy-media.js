/** @about Easy Media 1.0.0 @min_zeppos 3.0 @author: Silver, Zepp Health. @license: MIT */
import { create, id, codec } from "@zos/media";
/**
 * Class representing a sound player.
 */
export class SoundPlayer {
  #player;
  #filename;
  #is_playing;
  #auto_destroy;
  /**
   * Create a sound player.
   * @param {string} filename - The name of the file to play.
   * @param {boolean} stop_on_change - Whether to stop playback when changing files.
   */
  constructor(filename, stop_on_change = false) {
    this.#player = create(id.PLAYER);
    this.#filename = filename;
    this.#auto_destroy = stop_on_change;
    this.#player.setSource(this.#player.source.FILE, { file: this.#filename });
    this.#is_playing = false;

    this.#player.addEventListener(this.#player.event.PREPARE, (result) => {
      if (result) {
        this.#player.start();
      } else {
        this.destroy();
      }
    });

    this.#player.addEventListener(this.#player.event.COMPLETE, () => {
      this.stop();
    });
  }

  /**
   * Play the sound.
   * If the sound is already playing, it stops and prepares the sound again.
   */
   play() {
    if (this.#is_playing && this.#auto_destroy) {
      this.stop();
    }
    this.#is_playing = true;
    this.#player.prepare();
  }

  /**
   * Stop the sound.
   * If the sound is playing, it stops the sound and releases the player.
   */
  stop() {
    if (this.#is_playing) {
      this.#player.stop();
      this.#player.release();
      this.#is_playing = false;
    }
  }

  /**
   * Change the sound file.
   * @param {string} filename - The name of the new file to play.
   */
  changeFile(filename) {
    if (this.#is_playing && this.#auto_destroy) {
      this.stop();
    }
    this.#filename = filename;
    this.#player.setSource(this.#player.source.FILE, { file: this.#filename });
  }

  /**
   * Destroy the player.
   * If the sound is playing, it stops the sound and removes event listeners.
   */
  destroy() {
    if (this.#is_playing) {
      this.stop();
    }
    this.#player.removeEventListener(this.#player.event.PREPARE);
    this.#player.removeEventListener(this.#player.event.COMPLETE);
  }
}

/**
 * Class representing a sound recorder.
 */
export class SoundRecorder {
  #recorder;
  #target_file;
  /**
   * Create a sound recorder.
   * @param {string} target_file - The path to save the audio.
   */
  constructor(target_file) {
    this.#recorder = create(id.RECORDER);
    this.#target_file = target_file;
    this.#recorder.setFormat(codec.OPUS, { target_file: this.#target_file });
  }

  /**
   * Start recording.
   */
  start() {
    this.#recorder.start();
  }

  /**
   * Stop recording.
   */
  stop() {
    this.#recorder.stop();
  }

  /**
   * Change the target file.
   * @param {string} target_file - The path of the new file to record.
   */
  changeFile(target_file) {
    this.#target_file = target_file;
    this.#recorder.setFormat(codec.OPUS, { target_file: this.#target_file });
  }
}

/**
 * @changelog
 * 1.0.0
 * - initial release
 */
