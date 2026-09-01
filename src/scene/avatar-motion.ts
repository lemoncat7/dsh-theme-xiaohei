/** Runtime helpers inserted beside the Xiaohei model in ThreeUI's own r149 scene. */
export const XIAOHEI_AVATAR_MOTION_RUNTIME = `
  function xiaoheiMotionSmoothstep(a, b, value) {
    var t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function xiaoheiAvatarBuildRig(geometry, height) {
    var bones = {
      root: new THREE.Bone(),
      pelvis: new THREE.Bone(),
      torso: new THREE.Bone(),
      head: new THREE.Bone(),
      leftArm: new THREE.Bone(),
      rightArm: new THREE.Bone(),
      leftLeg: new THREE.Bone(),
      rightLeg: new THREE.Bone()
    };
    bones.root.name = 'xiaohei-rig-root';
    bones.pelvis.name = 'xiaohei-rig-pelvis';
    bones.torso.name = 'xiaohei-rig-torso';
    bones.head.name = 'xiaohei-rig-head';
    bones.leftArm.name = 'xiaohei-rig-arm-left';
    bones.rightArm.name = 'xiaohei-rig-arm-right';
    bones.leftLeg.name = 'xiaohei-rig-leg-left';
    bones.rightLeg.name = 'xiaohei-rig-leg-right';

    bones.root.add(bones.pelvis);
    bones.pelvis.position.set(0, height * 0.27, 0);
    bones.pelvis.add(bones.torso, bones.leftLeg, bones.rightLeg);
    bones.torso.position.set(0, height * 0.17, 0);
    bones.torso.add(bones.head, bones.leftArm, bones.rightArm);
    bones.head.position.set(0, height * 0.19, 0);
    bones.leftArm.position.set(-height * 0.115, height * 0.065, 0);
    bones.rightArm.position.set(height * 0.115, height * 0.065, 0);
    bones.leftLeg.position.set(-height * 0.055, 0, 0);
    bones.rightLeg.position.set(height * 0.055, 0, 0);

    var ordered = [
      bones.root,
      bones.pelvis,
      bones.torso,
      bones.head,
      bones.leftArm,
      bones.rightArm,
      bones.leftLeg,
      bones.rightLeg
    ];
    var position = geometry.getAttribute('position');
    var skinIndex = new Uint16Array(position.count * 4);
    var skinWeight = new Float32Array(position.count * 4);
    var halfWidth = height * 0.235;

    function weightPair(vertex, firstIndex, firstWeight, secondIndex) {
      var offset = vertex * 4;
      skinIndex[offset] = firstIndex;
      skinIndex[offset + 1] = secondIndex;
      skinWeight[offset] = firstWeight;
      skinWeight[offset + 1] = 1 - firstWeight;
    }

    for (var vertex = 0; vertex < position.count; vertex += 1) {
      var x = position.getX(vertex) / halfWidth;
      var y = position.getY(vertex) / height;
      var headWeight = xiaoheiMotionSmoothstep(0.53, 0.67, y);
      var legWeight = 1 - xiaoheiMotionSmoothstep(0.23, 0.38, y);
      var armWeight = xiaoheiMotionSmoothstep(0.38, 0.76, Math.abs(x))
        * (1 - xiaoheiMotionSmoothstep(0.55, 0.66, y))
        * xiaoheiMotionSmoothstep(0.25, 0.34, y);

      if (headWeight > 0.04) {
        weightPair(vertex, 3, headWeight, 2);
      } else if (legWeight > 0.04) {
        weightPair(vertex, x < 0 ? 6 : 7, legWeight, 1);
      } else if (armWeight > 0.04) {
        weightPair(vertex, x < 0 ? 4 : 5, armWeight, 2);
      } else {
        var torsoWeight = xiaoheiMotionSmoothstep(0.30, 0.48, y);
        weightPair(vertex, 2, torsoWeight, 1);
      }
    }

    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
    var skeleton = new THREE.Skeleton(ordered);
    return {
      rootBone: bones.root,
      skeleton: skeleton,
      bones: bones,
      rest: {
        pelvisY: bones.pelvis.position.y,
        torsoY: bones.torso.position.y,
        headY: bones.head.position.y
      }
    };
  }

  function xiaoheiAvatarPrepareMotion(avatar) {
    avatar.motion = {
      action: 'idle',
      anchorT: 0.42
    };
  }

  function xiaoheiAvatarPoseMotion(avatar, now) {
    var motion = avatar.motion;
    var rig = avatar.rig;
    if (!motion || !rig) return;
    var bones = rig.bones;
    var rest = rig.rest;
    var seconds = now * 0.001;
    var breath = Math.sin(seconds * 1.35);
    var quiet = Math.sin(seconds * 0.47 + 0.8);
    var gaze = xiaoheiAvatarHover;

    bones.pelvis.position.y = rest.pelvisY + breath * avatar.reviewedHeight * 0.0042;
    bones.torso.position.y = rest.torsoY + Math.sin(seconds * 1.35 + 0.6) * avatar.reviewedHeight * 0.0014;
    bones.head.position.y = rest.headY;
    bones.pelvis.rotation.set(0, 0, quiet * 0.009);
    bones.torso.rotation.set(0, 0, -quiet * 0.014);
    bones.head.rotation.set(
      (avatar.screenPitch || 0) + Math.sin(seconds * 0.72) * 0.018
        + (ndc.y <= 2 ? -ndc.y : 0) * gaze * 0.045,
      (ndc.x <= 2 ? ndc.x : 0) * gaze * 0.12,
      quiet * 0.030 - gaze * 0.014
    );
    bones.leftArm.rotation.set(0, 0, 0.035 + breath * 0.015 - gaze * 0.016);
    bones.rightArm.rotation.set(0, 0, -0.035 - breath * 0.015 + gaze * 0.016);
    bones.leftLeg.rotation.set(0, 0, 0);
    bones.rightLeg.rotation.set(0, 0, 0);
    avatar.model.position.y = breath * avatar.reviewedHeight * 0.0022;
    avatar.model.scale.set(1, 1, 1);
  }
`
