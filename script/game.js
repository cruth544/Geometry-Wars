var Shape = function (shape) {
  this.x
  this.y
  this.height
  this.width
  this.shape = shape
  this.collision = function (argument) {
    // body...
  }
  this.rotation = null
}
var Player = function (shape) {
  this.gun
  this.shield
  this.lives
  this.score
}
var Enemy = function (argument) {
  this.value
}
