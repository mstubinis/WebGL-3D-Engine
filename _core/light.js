'use strict';
var Light = function(name,scene){
	if(scene === undefined){
		if(name in Engine.scene.lights){ return Engine.scene.lights[name]; }
	}
	else{
		if(name in Engine.ResourceManager.scenes[scene].lights){ return Engine.ResourceManager.scenes[scene].lights[name]; }
	}
    
	this._position = vec4.fill(0,0,0);
	this.w = 1.0;
	
	this.modelMatrix = mat4.create();
	this.rotation = quat.fill(0,0,0,1);
	this.scale = vec3.fill(1,1,1);
	
	this.color = vec3.fill(1,1,1);
	this.specularPower = 1.0;
	this.diffusePower = 1.0;
	this.ambientPower = 0.05;
	
	this.constant = 0.3;
	this.linear = 0.2;
	this.exponent = 0.3;
	
	
	//this is important
	var shader = Engine.ResourceManager.shaders["Default"].program;
	var lightLocations = [
	  "LightProperties",
	  "LightColor",
	  "LightPosition",
	  "LightAttenuation"
	];
	var locations = {};
	for (var i = 0; i < lightLocations.length; ++i){
		if(scene === undefined){
			var l = Object.keys(Engine.scene.lights).length;
			var str = "lights[" + l + "]." + lightLocations[i];
			locations[lightLocations[i]] = str;
		}
		else{
			var l = Object.keys(Engine.ResourceManager.scenes[scene].lights).length;
			var str = "lights[" + l + "]." + lightLocations[i];
			locations[lightLocations[i]] = str;
		}
	}
	this.uniforms = locations;
	//
	
	
	if(scene === undefined)
		Engine.scene.lights[name] = this;
	else
		Engine.ResourceManager.scenes[scene].lights[name] = this;
}
Light.prototype.sendUniforms = function(shader){
	var pos = this.position();
	if(this.w != 0.0){
		gl.uniform3f(gl.getUniformLocation(shader,this.uniforms["LightAttenuation"]), this.constant,this.linear,this.exponent);
	}
	gl.uniform3f(gl.getUniformLocation(shader,this.uniforms["LightPosition"]), pos[0],pos[1],pos[2]);
	gl.uniform3f(gl.getUniformLocation(shader,this.uniforms["LightColor"]), this.color[0],this.color[1],this.color[2]);
	gl.uniform4f(gl.getUniformLocation(shader,this.uniforms["LightProperties"]),this.ambientPower,this.diffusePower,this.specularPower,this.w);
}
Light.prototype.translate = function(x,y,z) {
    Engine.GameObjectManager.translate(this,x,y,z);
};
Light.prototype.scale = function(x,y,z){
    Engine.GameObjectManager.scale(this,x,y,z);
}
Light.prototype.setScale = function(x,y,z){
    Engine.GameObjectManager.setScale(this,x,y,z);
}
Light.prototype.update = function(dt){
    mat4.identity(this.modelMatrix);

    mat4.translate(this.modelMatrix,this.modelMatrix,this._position);
    var mat4FromQuat = mat4.create(); mat4.fromQuat(mat4FromQuat,this.rotation);
    mat4.mul(this.modelMatrix,this.modelMatrix,mat4FromQuat);
    mat4.scale(this.modelMatrix,this.modelMatrix,this.scale);
}
Light.prototype.setPosition = function(x,y,z){
    Engine.GameObjectManager.setPosition(this,x,y,z);
    this.update(Engine.dt);
}
Light.prototype.rotate = function(x,y,z){
    Engine.GameObjectManager.rotate(this,x,y,z);
}
Light.prototype.rotateX = function(x){ this.rotate(x,0,0); }
Light.prototype.rotateY = function(y){ this.rotate(0,y,0); }
Light.prototype.rotateZ = function(z){ this.rotate(0,0,z); }
    
Light.prototype.up = function(){ return Engine.GameObjectManager.up(this); }
Light.prototype.right = function(){ return Engine.GameObjectManager.right(this); }
Light.prototype.forward = function(){ return Engine.GameObjectManager.forward(this); }
Light.prototype.position = function(){ return Engine.GameObjectManager.position(this); }