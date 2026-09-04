/** Runtime helpers inserted beside the Xiaohei model in ThreeUI's own r149 scene. */
export const XIAOHEI_AVATAR_MOTION_RUNTIME = `
  var xiaoheiMotionEuler = new THREE.Euler();
  var xiaoheiMotionDeltaQ = new THREE.Quaternion();
  var xiaoheiMotionPoseQ = new THREE.Quaternion();
  var xiaoheiMotionArmDown = {
    leftUpper: new THREE.Quaternion(0.54427280, 0.01192567, 0.03342154, 0.83815747),
    rightUpper: new THREE.Quaternion(0.54406160, -0.01540707, -0.03727146, 0.83807547),
    leftLower: new THREE.Quaternion(0, 0, 0, 1),
    rightLower: new THREE.Quaternion(0, 0, 0, 1)
  };
  var xiaoheiMotionSitArms = {
    leftUpper: new THREE.Quaternion(0.42277680, 0.04837124, 0.43673194, 0.79258139),
    rightUpper: new THREE.Quaternion(0.58108784, 0.00464093, 0.18044704, 0.79357061),
    leftLower: new THREE.Quaternion(0.00485389, -0.02619754, 0.18480416, 0.98241418),
    rightLower: new THREE.Quaternion(0.12449678, 0.00258430, -0.01948060, 0.99202538)
  };

  function xiaoheiMotionSmoothstep(a, b, value) {
    var t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function xiaoheiAvatarFindLegRegions(geometry, height) {
    var position = geometry.getAttribute('position');
    var index = geometry.getIndex();
    var parent = new Int32Array(position.count);
    for (var vertex = 0; vertex < position.count; vertex += 1) parent[vertex] = vertex;

    function find(vertexIndex) {
      var root = vertexIndex;
      while (parent[root] !== root) root = parent[root];
      while (parent[vertexIndex] !== vertexIndex) {
        var next = parent[vertexIndex];
        parent[vertexIndex] = root;
        vertexIndex = next;
      }
      return root;
    }

    function join(first, second) {
      var firstRoot = find(first);
      var secondRoot = find(second);
      if (firstRoot !== secondRoot) parent[secondRoot] = firstRoot;
    }

    if (index) {
      for (var offset = 0; offset < index.count; offset += 3) {
        var first = index.getX(offset);
        join(first, index.getX(offset + 1));
        join(first, index.getX(offset + 2));
      }
    }

    var regions = Object.create(null);
    for (vertex = 0; vertex < position.count; vertex += 1) {
      var root = find(vertex);
      var x = position.getX(vertex) / height;
      var y = position.getY(vertex) / height;
      var region = regions[root];
      if (!region) {
        region = regions[root] = { minX: x, maxX: x, minY: y, maxY: y };
      } else {
        region.minX = Math.min(region.minX, x);
        region.maxX = Math.max(region.maxX, x);
        region.minY = Math.min(region.minY, y);
        region.maxY = Math.max(region.maxY, y);
      }
    }

    var legSide = new Int8Array(position.count);
    for (vertex = 0; vertex < position.count; vertex += 1) {
      root = find(vertex);
      region = regions[root];
      /* The shorts are built from separate side panels too. Keep every island
         that rises into the garment on the pelvis, otherwise the two panels
         rotate like rigid armour plates when a thigh swings. */
      if (region.minY >= 0.36 || region.maxY >= 0.44) continue;
      if (region.maxX < 0.012 && region.minX > -0.19) legSide[vertex] = -1;
      else if (region.minX > -0.012 && region.maxX < 0.19) legSide[vertex] = 1;
    }
    return legSide;
  }

  function xiaoheiAvatarBuildRig(geometry, height) {
    var bones = {
      root: new THREE.Bone(),
      pelvis: new THREE.Bone(),
      spine: new THREE.Bone(),
      chest: new THREE.Bone(),
      neck: new THREE.Bone(),
      head: new THREE.Bone(),
      upperArmL: new THREE.Bone(),
      lowerArmL: new THREE.Bone(),
      handL: new THREE.Bone(),
      upperArmR: new THREE.Bone(),
      lowerArmR: new THREE.Bone(),
      handR: new THREE.Bone(),
      upperLegL: new THREE.Bone(),
      lowerLegL: new THREE.Bone(),
      footL: new THREE.Bone(),
      upperLegR: new THREE.Bone(),
      lowerLegR: new THREE.Bone(),
      footR: new THREE.Bone()
    };
    var boneNames = {
      root: 'root',
      pelvis: 'pelvis',
      spine: 'spine',
      chest: 'chest',
      neck: 'neck',
      head: 'head',
      upperArmL: 'upper-arm-left',
      lowerArmL: 'lower-arm-left',
      handL: 'hand-left',
      upperArmR: 'upper-arm-right',
      lowerArmR: 'lower-arm-right',
      handR: 'hand-right',
      upperLegL: 'upper-leg-left',
      lowerLegL: 'lower-leg-left',
      footL: 'foot-left',
      upperLegR: 'upper-leg-right',
      lowerLegR: 'lower-leg-right',
      footR: 'foot-right'
    };
    Object.keys(boneNames).forEach(function (key) {
      bones[key].name = 'xiaohei-rig-' + boneNames[key];
    });

    bones.root.add(bones.pelvis);
    bones.pelvis.position.set(0, height * 0.285, 0);
    bones.pelvis.add(bones.spine, bones.upperLegL, bones.upperLegR);
    bones.spine.position.set(0, height * 0.105, 0);
    bones.spine.add(bones.chest);
    bones.chest.position.set(0, height * 0.135, 0);
    bones.chest.add(bones.neck, bones.upperArmL, bones.upperArmR);
    bones.neck.position.set(0, height * 0.080, 0);
    bones.neck.add(bones.head);
    bones.head.position.set(0, height * 0.055, 0);

    bones.upperArmL.position.set(-height * 0.095, height * 0.035, 0);
    bones.upperArmL.add(bones.lowerArmL);
    bones.lowerArmL.position.set(-height * 0.125, 0, 0);
    bones.lowerArmL.add(bones.handL);
    bones.handL.position.set(-height * 0.085, 0, 0);
    bones.upperArmR.position.set(height * 0.095, height * 0.035, 0);
    bones.upperArmR.add(bones.lowerArmR);
    bones.lowerArmR.position.set(height * 0.125, 0, 0);
    bones.lowerArmR.add(bones.handR);
    bones.handR.position.set(height * 0.085, 0, 0);

    bones.upperLegL.position.set(-height * 0.055, height * 0.065, 0);
    bones.upperLegL.add(bones.lowerLegL);
    bones.lowerLegL.position.set(0, -height * 0.140, 0);
    bones.lowerLegL.add(bones.footL);
    bones.footL.position.set(0, -height * 0.120, height * 0.008);
    bones.upperLegR.position.set(height * 0.055, height * 0.065, 0);
    bones.upperLegR.add(bones.lowerLegR);
    bones.lowerLegR.position.set(0, -height * 0.140, 0);
    bones.lowerLegR.add(bones.footR);
    bones.footR.position.set(0, -height * 0.120, height * 0.008);

    var ordered = [
      bones.root,
      bones.pelvis,
      bones.spine,
      bones.chest,
      bones.neck,
      bones.head,
      bones.upperArmL,
      bones.lowerArmL,
      bones.handL,
      bones.upperArmR,
      bones.lowerArmR,
      bones.handR,
      bones.upperLegL,
      bones.lowerLegL,
      bones.footL,
      bones.upperLegR,
      bones.lowerLegR,
      bones.footR
    ];
    var position = geometry.getAttribute('position');
    var legSide = xiaoheiAvatarFindLegRegions(geometry, height);
    var skinIndex = new Uint16Array(position.count * 4);
    var skinWeight = new Float32Array(position.count * 4);

    function weightPair(vertex, firstIndex, firstWeight, secondIndex) {
      var offset = vertex * 4;
      var clamped = Math.max(0, Math.min(1, firstWeight));
      skinIndex[offset] = firstIndex;
      skinIndex[offset + 1] = secondIndex;
      skinWeight[offset] = clamped;
      skinWeight[offset + 1] = 1 - clamped;
    }

    for (var vertex = 0; vertex < position.count; vertex += 1) {
      var x = position.getX(vertex) / height;
      var y = position.getY(vertex) / height;
      var ax = Math.abs(x);
      var left = x < 0;

      var armMask = xiaoheiMotionSmoothstep(0.105, 0.155, ax)
        * xiaoheiMotionSmoothstep(0.515, 0.545, y)
        * (1 - xiaoheiMotionSmoothstep(0.615, 0.645, y));
      if (armMask > 0.06) {
        var upperArm = left ? 6 : 9;
        var lowerArm = left ? 7 : 10;
        var hand = left ? 8 : 11;
        if (ax < 0.190) {
          weightPair(vertex, upperArm, armMask, 3);
        } else if (ax < 0.270) {
          weightPair(vertex, lowerArm, xiaoheiMotionSmoothstep(0.205, 0.265, ax), upperArm);
        } else if (ax < 0.335) {
          weightPair(vertex, hand, xiaoheiMotionSmoothstep(0.292, 0.332, ax), lowerArm);
        } else {
          weightPair(vertex, hand, 1, lowerArm);
        }
        continue;
      }

      if (y >= 0.585) {
        var headWeight = xiaoheiMotionSmoothstep(0.595, 0.650, y);
        weightPair(vertex, 5, headWeight, 4);
        continue;
      }

      if (legSide[vertex]) {
        var legIsLeft = legSide[vertex] < 0;
        var upperLeg = legIsLeft ? 12 : 15;
        var lowerLeg = legIsLeft ? 13 : 16;
        var foot = legIsLeft ? 14 : 17;
        if (y < 0.135) {
          weightPair(vertex, foot, xiaoheiMotionSmoothstep(0.135, 0.075, y), lowerLeg);
        } else if (y < 0.270) {
          weightPair(vertex, lowerLeg, 1 - xiaoheiMotionSmoothstep(0.210, 0.270, y), upperLeg);
        } else {
          weightPair(vertex, upperLeg, 1 - xiaoheiMotionSmoothstep(0.340, 0.405, y), 1);
        }
        continue;
      }

      if (y >= 0.535) {
        weightPair(vertex, 4, xiaoheiMotionSmoothstep(0.545, 0.605, y), 3);
      } else if (y >= 0.420) {
        weightPair(vertex, 3, xiaoheiMotionSmoothstep(0.430, 0.515, y), 2);
      } else if (y >= 0.285) {
        weightPair(vertex, 2, xiaoheiMotionSmoothstep(0.300, 0.410, y), 1);
      } else {
        weightPair(vertex, 1, 1, 0);
      }
    }

    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
    return {
      rootBone: bones.root,
      skeleton: new THREE.Skeleton(ordered),
      bones: bones,
      rest: {
        pelvisY: bones.pelvis.position.y,
        spineY: bones.spine.position.y,
        chestY: bones.chest.position.y,
        neckY: bones.neck.position.y,
        headY: bones.head.position.y,
        upperArmLX: bones.upperArmL.position.x,
        upperArmRX: bones.upperArmR.position.x
      }
    };
  }

  function xiaoheiAvatarPrepareMotion(avatar) {
    avatar.motion = {
      action: 'settle',
      anchorLimb: 0,
      anchorT: 0.38,
      walkMinT: 0.30,
      walkMaxT: 0.48,
      walkSpeed: 0.021,
      walkDirection: 1,
      walkPhase: 0,
      walkBlend: 0,
      runBlend: 0,
      queuedAction: '',
      lastAction: '',
      travelTargetT: 0.38,
      poseReview: 'sit',
      reviewStarted: 0,
      reviewProgress: 0,
      reviewStartT: 0.38,
      reviewSeatT: 0.38,
      reviewSeatReady: false,
      phase: 'settle',
      phaseStarted: 0,
      phaseUntil: 0,
      lastNow: 0,
      reportedAction: ''
    };
  }

  function xiaoheiAvatarSetMotionPhase(motion, phase, now, duration) {
    motion.phase = phase;
    motion.phaseStarted = now;
    motion.phaseUntil = duration ? now + duration : 0;
  }

  function xiaoheiAvatarMotionProgress(motion, now) {
    var duration = motion.phaseUntil - motion.phaseStarted;
    if (duration <= 0) return 0;
    return xiaoheiMotionSmoothstep(
      0,
      1,
      (now - motion.phaseStarted) / duration
    );
  }

  function xiaoheiAvatarBeginIndependentAction(motion, now) {
    var roll = Math.random();
    var action = roll < 0.30
      ? 'walk'
      : roll < 0.48
        ? 'jump'
        : roll < 0.66
          ? 'sit'
          : roll < 0.82
            ? 'run'
            : 'idle';
    if (action === motion.lastAction) action = action === 'walk' ? 'jump' : 'walk';
    motion.lastAction = action;
    if (action === 'idle') {
      xiaoheiAvatarSetMotionPhase(motion, 'idle', now, 1800 + Math.random() * 1400);
      return;
    }
    if (action === 'jump') {
      xiaoheiAvatarSetMotionPhase(motion, 'jump-crouch', now, 280);
      return;
    }
    if (action === 'sit') {
      xiaoheiAvatarSetMotionPhase(motion, 'sit-down', now, 680);
      return;
    }
    var distance = action === 'run'
      ? 0.045 + Math.random() * 0.025
      : 0.026 + Math.random() * 0.020;
    var direction = Math.random() < 0.5 ? -1 : 1;
    if (motion.anchorT <= motion.walkMinT + 0.025) direction = 1;
    if (motion.anchorT >= motion.walkMaxT - 0.025) direction = -1;
    motion.walkDirection = direction;
    motion.travelTargetT = THREE.MathUtils.clamp(
      motion.anchorT + direction * distance,
      motion.walkMinT,
      motion.walkMaxT
    );
    motion.queuedAction = action;
    xiaoheiAvatarSetMotionPhase(motion, 'turn', now, 440);
  }

  function xiaoheiAvatarAdvanceMotion(avatar, now) {
    var motion = avatar.motion;
    if (!motion) return;
    if (!motion.lastNow) motion.lastNow = now;
    var dt = Math.min(0.05, Math.max(0, (now - motion.lastNow) * 0.001));
    motion.lastNow = now;
    var scanComplete = !avatar.scan || avatar.scan.complete;

    if (motion.poseReview) {
      if (scanComplete && motion.reviewSeatReady && !motion.reviewStarted) {
        motion.reviewStarted = now + 650;
      }
      if (motion.reviewStarted) {
        motion.reviewProgress = THREE.MathUtils.clamp(
          (now - motion.reviewStarted) / 1350,
          0,
          1
        );
      }
      motion.phase = motion.reviewProgress < 1 ? 'sit-review-transition' : 'sit-review';
      motion.action = motion.phase;
      motion.anchorT = THREE.MathUtils.lerp(
        motion.reviewStartT,
        motion.reviewSeatT,
        xiaoheiMotionSmoothstep(0, 0.58, motion.reviewProgress)
      );
      motion.walkBlend = 0;
      motion.runBlend = 0;
      if (motion.reportedAction !== motion.action) {
        motion.reportedAction = motion.action;
        document.documentElement.dataset.xiaoheiAvatarAction = motion.action + '-3d';
        document.documentElement.dataset.xiaoheiAvatarPose = motion.action;
      }
      return;
    }

    if (REDUCED || !scanComplete) {
      motion.action = 'settle';
      motion.walkBlend += (0 - motion.walkBlend) * (1 - Math.exp(-dt * 8));
      motion.runBlend += (0 - motion.runBlend) * (1 - Math.exp(-dt * 8));
    } else {
      if (motion.phase === 'settle') {
        xiaoheiAvatarSetMotionPhase(motion, 'idle', now, 1400);
      } else if (motion.phase === 'idle' && now >= motion.phaseUntil) {
        xiaoheiAvatarBeginIndependentAction(motion, now);
      } else if (motion.phase === 'turn' && now >= motion.phaseUntil) {
        var queuedAction = motion.queuedAction || 'walk';
        motion.queuedAction = '';
        xiaoheiAvatarSetMotionPhase(motion, queuedAction, now, 0);
      } else if (motion.phase === 'jump-crouch' && now >= motion.phaseUntil) {
        xiaoheiAvatarSetMotionPhase(motion, 'jump-air', now, 680);
      } else if (motion.phase === 'jump-air' && now >= motion.phaseUntil) {
        xiaoheiAvatarSetMotionPhase(motion, 'jump-land', now, 320);
      } else if (motion.phase === 'jump-land' && now >= motion.phaseUntil) {
        xiaoheiAvatarSetMotionPhase(motion, 'idle', now, 1500 + Math.random() * 1100);
      } else if (motion.phase === 'sit-down' && now >= motion.phaseUntil) {
        xiaoheiAvatarSetMotionPhase(motion, 'sit', now, 1650);
      } else if (motion.phase === 'sit' && now >= motion.phaseUntil) {
        xiaoheiAvatarSetMotionPhase(motion, 'stand-up', now, 720);
      } else if (motion.phase === 'stand-up' && now >= motion.phaseUntil) {
        xiaoheiAvatarSetMotionPhase(motion, 'idle', now, 1600 + Math.random() * 1200);
      }

      var travelling = motion.phase === 'walk' || motion.phase === 'run';
      if (travelling) {
        var running = motion.phase === 'run';
        motion.anchorT += motion.walkDirection
          * (running ? 0.036 : motion.walkSpeed)
          * dt;
        motion.walkPhase += dt * (running ? 9.4 : 6.7);
        var reachedTarget = motion.walkDirection > 0
          ? motion.anchorT >= motion.travelTargetT
          : motion.anchorT <= motion.travelTargetT;
        if (reachedTarget) {
          motion.anchorT = motion.travelTargetT;
          xiaoheiAvatarSetMotionPhase(motion, 'idle', now, 1500 + Math.random() * 1300);
        }
      }

      var actions = {
        walk: 'walking',
        run: 'running',
        turn: 'turning',
        'jump-crouch': 'jumping',
        'jump-air': 'jumping',
        'jump-land': 'landing',
        'sit-down': 'sitting-down',
        sit: 'sitting',
        'stand-up': 'standing-up'
      };
      motion.action = actions[motion.phase] || 'waiting';
      var locomotionTarget = travelling ? 1 : 0;
      var runTarget = motion.phase === 'run' ? 1 : 0;
      motion.walkBlend += (locomotionTarget - motion.walkBlend)
        * (1 - Math.exp(-dt * 10));
      motion.runBlend += (runTarget - motion.runBlend)
        * (1 - Math.exp(-dt * 10));
    }

    if (motion.reportedAction !== motion.action) {
      motion.reportedAction = motion.action;
      document.documentElement.dataset.xiaoheiAvatarAction = motion.action + '-3d';
      document.documentElement.dataset.xiaoheiAvatarPose = motion.action;
    }
  }

  function xiaoheiAvatarRestoreImportedRig(rig) {
    Object.keys(rig.restByName).forEach(function (name) {
      var bone = rig.bonesByName[name];
      var rest = rig.restByName[name];
      bone.position.copy(rest.position);
      bone.quaternion.copy(rest.quaternion);
      bone.scale.copy(rest.scale);
    });
  }

  function xiaoheiAvatarApplyImportedDelta(rig, name, x, y, z) {
    var bone = rig.bonesByName[name];
    var rest = rig.restByName[name];
    if (!bone || !rest) return;
    xiaoheiMotionEuler.set(x, y, z, 'XYZ');
    xiaoheiMotionDeltaQ.setFromEuler(xiaoheiMotionEuler);
    bone.quaternion.copy(rest.quaternion).multiply(xiaoheiMotionDeltaQ);
  }

  function xiaoheiAvatarApplyImportedArmPose(rig, name, base, swing) {
    var bone = rig.bonesByName[name];
    var rest = rig.restByName[name];
    if (!bone || !rest) return;
    xiaoheiMotionEuler.set(swing, 0, 0, 'XYZ');
    xiaoheiMotionDeltaQ.setFromEuler(xiaoheiMotionEuler);
    bone.quaternion.copy(rest.quaternion).multiply(base).multiply(xiaoheiMotionDeltaQ);
  }

  function xiaoheiAvatarApplyImportedArmBlend(rig, name, from, to, blend) {
    var bone = rig.bonesByName[name];
    var rest = rig.restByName[name];
    if (!bone || !rest) return;
    xiaoheiMotionPoseQ.copy(from).slerp(to, blend);
    bone.quaternion.copy(rest.quaternion).multiply(xiaoheiMotionPoseQ);
  }

  /* Mixamo legs are hinge joints in the sagittal plane. Keep the complete
     gait on each bone's local X axis: this prevents a procedural target from
     twisting a knee sideways or rolling a shoe onto its outer edge. */
  function xiaoheiAvatarResolveImportedLegPose(phase, blend, runBlend) {
    var stanceEnd = THREE.MathUtils.lerp(0.62, 0.54, runBlend);
    var forward = THREE.MathUtils.lerp(0.24, 0.34, runBlend);
    var backward = THREE.MathUtils.lerp(-0.22, -0.30, runBlend);
    var swingKnee = THREE.MathUtils.lerp(0.62, 0.82, runBlend);
    var hip = 0;
    var knee = 0;
    if (phase < stanceEnd) {
      var stance = xiaoheiMotionSmoothstep(0, stanceEnd, phase);
      hip = THREE.MathUtils.lerp(forward, backward, stance);
      knee = -0.045 - Math.sin(Math.PI * stance)
        * THREE.MathUtils.lerp(0.055, 0.10, runBlend);
    } else {
      var swing = xiaoheiMotionSmoothstep(stanceEnd, 1, phase);
      hip = THREE.MathUtils.lerp(backward, forward, swing);
      knee = -0.045 - Math.sin(Math.PI * swing) * swingKnee;
    }
    hip *= blend;
    knee *= blend;
    return {
      hip: hip,
      knee: Math.min(0, knee),
      foot: THREE.MathUtils.clamp(-hip - knee * 0.72, -0.30, 0.46)
    };
  }

  function xiaoheiAvatarResolveImportedActionPose(avatar, now) {
    var motion = avatar.motion;
    var progress = xiaoheiAvatarMotionProgress(motion, now);
    var pose = {
      sit: 0,
      crouch: 0,
      air: 0,
      rootY: 0,
      spineX: 0,
      armX: 0
    };
    if (motion.phase === 'sit-down') pose.sit = progress;
    else if (motion.phase === 'sit') pose.sit = 1;
    else if (motion.phase === 'stand-up') pose.sit = 1 - progress;
    else if (motion.phase === 'jump-crouch') pose.crouch = progress;
    else if (motion.phase === 'jump-air') {
      pose.crouch = 1 - Math.sin(Math.PI * progress) * 0.48;
      pose.air = Math.sin(Math.PI * progress);
    } else if (motion.phase === 'jump-land') {
      pose.crouch = 1 - progress;
    }
    pose.rootY = -pose.sit * avatar.reviewedHeight * 0.235
      - pose.crouch * avatar.reviewedHeight * 0.052
      + pose.air * avatar.reviewedHeight * 0.13;
    pose.spineX = pose.sit * 0.12 + pose.crouch * 0.10;
    pose.armX = pose.crouch * 0.10 + pose.air * 0.12;
    return pose;
  }

  function xiaoheiAvatarPoseImportedMotion(avatar, now) {
    var motion = avatar.motion;
    var rig = avatar.rig;
    var seconds = now * 0.001;
    var breath = Math.sin(seconds * 1.45);
    var sway = Math.sin(seconds * 0.58 + 0.7);
    var gaze = xiaoheiAvatarHover;
    var pointerX = ndc.x <= 2 ? ndc.x : 0;
    var pointerY = ndc.y <= 2 ? ndc.y : 0;
    var walk = motion.walkBlend || 0;
    var run = motion.runBlend || 0;
    var step = Math.sin(motion.walkPhase || 0) * walk;
    var actionPose = xiaoheiAvatarResolveImportedActionPose(avatar, now);
    var armSwing = step * THREE.MathUtils.lerp(0.055, 0.15, run);

    xiaoheiAvatarRestoreImportedRig(rig);
    if (motion.poseReview) {
      var review = xiaoheiMotionSmoothstep(0, 1, motion.reviewProgress || 0);
      var support = xiaoheiMotionSmoothstep(0.12, 0.88, review);
      var seated = xiaoheiMotionSmoothstep(0, 0.78, review);
      var dangling = review > 0.98
        ? Math.sin((now - motion.reviewStarted) * 0.001 * 1.45) * 0.085
        : 0;
      xiaoheiAvatarApplyImportedDelta(
        rig, 'mixamorig:Spine', seated * 0.075, 0, seated * -0.055
      );
      xiaoheiAvatarApplyImportedDelta(
        rig, 'mixamorig:Spine2', seated * -0.035, 0, seated * 0.025
      );
      xiaoheiAvatarApplyImportedDelta(
        rig, 'mixamorig:Head', avatar.screenPitch || 0, 0, seated * 0.035
      );
      xiaoheiAvatarApplyImportedArmBlend(
        rig, 'mixamorig:LeftArm',
        xiaoheiMotionArmDown.leftUpper, xiaoheiMotionSitArms.leftUpper, support
      );
      xiaoheiAvatarApplyImportedArmBlend(
        rig, 'mixamorig:RightArm',
        xiaoheiMotionArmDown.rightUpper, xiaoheiMotionSitArms.rightUpper, support
      );
      xiaoheiAvatarApplyImportedArmBlend(
        rig, 'mixamorig:LeftForeArm',
        xiaoheiMotionArmDown.leftLower, xiaoheiMotionSitArms.leftLower, support
      );
      xiaoheiAvatarApplyImportedArmBlend(
        rig, 'mixamorig:RightForeArm',
        xiaoheiMotionArmDown.rightLower, xiaoheiMotionSitArms.rightLower, support
      );
      xiaoheiAvatarApplyImportedDelta(
        rig, 'mixamorig:LeftUpLeg', seated * 1.08, 0, 0
      );
      xiaoheiAvatarApplyImportedDelta(
        rig, 'mixamorig:LeftLeg', seated * (-1.02 + dangling), 0, 0
      );
      xiaoheiAvatarApplyImportedDelta(
        rig, 'mixamorig:LeftFoot', seated * 0.20, 0, 0
      );
      xiaoheiAvatarApplyImportedDelta(
        rig, 'mixamorig:RightUpLeg', seated * 0.78, 0, 0
      );
      xiaoheiAvatarApplyImportedDelta(
        rig, 'mixamorig:RightLeg', seated * -1.26, 0, 0
      );
      xiaoheiAvatarApplyImportedDelta(
        rig, 'mixamorig:RightFoot', seated * 0.36, 0, 0
      );
      avatar.model.position.y = (avatar.groundOffset || 0)
        - avatar.reviewedHeight * 0.369 * seated;
      avatar.model.scale.set(1, 1, 1);
      return;
    }
    xiaoheiAvatarApplyImportedDelta(
      rig, 'mixamorig:Spine',
      breath * 0.012 + walk * THREE.MathUtils.lerp(0.025, 0.075, run)
        + actionPose.spineX,
      -sway * 0.010,
      -sway * 0.015
    );
    xiaoheiAvatarApplyImportedDelta(
      rig, 'mixamorig:Spine2',
      -breath * 0.010,
      sway * 0.012,
      sway * 0.012
    );
    xiaoheiAvatarApplyImportedDelta(
      rig, 'mixamorig:Head',
      (avatar.screenPitch || 0) + Math.sin(seconds * 0.78) * 0.018 - pointerY * gaze * 0.045,
      pointerX * gaze * 0.12 - sway * 0.012,
      sway * 0.018
    );
    xiaoheiAvatarApplyImportedArmPose(
      rig, 'mixamorig:LeftArm',
      xiaoheiMotionArmDown.leftUpper,
      -armSwing - actionPose.armX + breath * 0.008
    );
    xiaoheiAvatarApplyImportedArmPose(
      rig, 'mixamorig:RightArm',
      xiaoheiMotionArmDown.rightUpper,
      armSwing + actionPose.armX - breath * 0.008
    );
    xiaoheiAvatarApplyImportedArmPose(
      rig, 'mixamorig:LeftForeArm',
      xiaoheiMotionArmDown.leftLower,
      run * Math.max(0, step) * 0.035
    );
    xiaoheiAvatarApplyImportedArmPose(
      rig, 'mixamorig:RightForeArm',
      xiaoheiMotionArmDown.rightLower,
      -run * Math.max(0, -step) * 0.035
    );

    avatar.model.position.y = (avatar.groundOffset || 0) + actionPose.rootY;
    avatar.model.scale.set(1, 1, 1);
    if (
      (motion.phase === 'walk' || motion.phase === 'run')
      && walk > 0.04
      && (!avatar.scan || avatar.scan.complete)
    ) {
      var cycle = (motion.walkPhase / (Math.PI * 2)) % 1;
      if (cycle < 0) cycle += 1;
      var leftLeg = xiaoheiAvatarResolveImportedLegPose(cycle, walk, run);
      var rightLeg = xiaoheiAvatarResolveImportedLegPose((cycle + 0.5) % 1, walk, run);
    } else {
      leftLeg = { hip: 0, knee: 0, foot: 0 };
      rightLeg = { hip: 0, knee: 0, foot: 0 };
    }
    var seatedHip = actionPose.sit * 0.82;
    var seatedKnee = actionPose.sit * -1.18;
    var seatedFoot = actionPose.sit * 0.30;
    var jumpHip = actionPose.crouch * 0.20;
    var jumpKnee = actionPose.crouch * -0.58;
    var jumpFoot = actionPose.crouch * 0.22;
    xiaoheiAvatarApplyImportedDelta(
      rig, 'mixamorig:LeftUpLeg',
      THREE.MathUtils.clamp(leftLeg.hip + seatedHip + jumpHip, -0.55, 1.10), 0, 0
    );
    xiaoheiAvatarApplyImportedDelta(
      rig, 'mixamorig:LeftLeg',
      THREE.MathUtils.clamp(leftLeg.knee + seatedKnee + jumpKnee, -1.32, 0), 0, 0
    );
    xiaoheiAvatarApplyImportedDelta(
      rig, 'mixamorig:LeftFoot',
      THREE.MathUtils.clamp(leftLeg.foot + seatedFoot + jumpFoot, -0.34, 0.52), 0, 0
    );
    xiaoheiAvatarApplyImportedDelta(
      rig, 'mixamorig:RightUpLeg',
      THREE.MathUtils.clamp(rightLeg.hip + seatedHip + jumpHip, -0.55, 1.10), 0, 0
    );
    xiaoheiAvatarApplyImportedDelta(
      rig, 'mixamorig:RightLeg',
      THREE.MathUtils.clamp(rightLeg.knee + seatedKnee + jumpKnee, -1.32, 0), 0, 0
    );
    xiaoheiAvatarApplyImportedDelta(
      rig, 'mixamorig:RightFoot',
      THREE.MathUtils.clamp(rightLeg.foot + seatedFoot + jumpFoot, -0.34, 0.52), 0, 0
    );
  }

  function xiaoheiAvatarPoseMotion(avatar, now) {
    var motion = avatar.motion;
    var rig = avatar.rig;
    if (!motion || !rig) return;
    if (rig.imported) {
      xiaoheiAvatarPoseImportedMotion(avatar, now);
      return;
    }
    if (avatar.animation) {
      if (!avatar.animation.lastNow) avatar.animation.lastNow = now;
      var animationDelta = Math.min(
        0.05,
        Math.max(0, (now - avatar.animation.lastNow) * 0.001)
      );
      avatar.animation.lastNow = now;
      if (!avatar.scan || avatar.scan.complete) avatar.animation.mixer.update(animationDelta);
      avatar.model.position.y = avatar.groundOffset || 0;
      avatar.model.scale.set(1, 1, 1);
      return;
    }
    var bones = rig.bones;
    var rest = rig.rest;
    var seconds = now * 0.001;
    var breath = Math.sin(seconds * 1.45);
    var breathLift = Math.sin(seconds * 1.45 + 0.58);
    var sway = Math.sin(seconds * 0.56 + 0.7);
    var counterSway = Math.sin(seconds * 0.56 + 2.65);
    var gaze = xiaoheiAvatarHover;
    var pointerX = ndc.x <= 2 ? ndc.x : 0;
    var pointerY = ndc.y <= 2 ? ndc.y : 0;
    var walk = motion.walkBlend || 0;
    var step = Math.sin(motion.walkPhase || 0);
    var stepOpposite = Math.sin((motion.walkPhase || 0) + Math.PI);
    var strideL = step * walk;
    var strideR = stepOpposite * walk;
    var footfall = Math.abs(Math.cos(motion.walkPhase || 0)) * walk;

    bones.pelvis.position.y = rest.pelvisY
      + breath * avatar.reviewedHeight * 0.0035 * (1 - walk * 0.65)
      + footfall * avatar.reviewedHeight * 0.0055;
    bones.spine.position.y = rest.spineY + breathLift * avatar.reviewedHeight * 0.0012;
    bones.chest.position.y = rest.chestY + breathLift * avatar.reviewedHeight * 0.0018;
    bones.neck.position.y = rest.neckY;
    bones.head.position.y = rest.headY;
    bones.upperArmL.position.x = rest.upperArmLX * 0.92;
    bones.upperArmR.position.x = rest.upperArmRX * 0.92;

    bones.pelvis.rotation.set(strideL * 0.025, sway * 0.006, sway * 0.013);
    bones.spine.rotation.set(breath * 0.007 + walk * 0.035, -sway * 0.010, -sway * 0.020);
    bones.chest.rotation.set(-breath * 0.009 - walk * 0.022, sway * 0.014, sway * 0.014);
    bones.neck.rotation.set(-breath * 0.004, 0, -sway * 0.006);
    bones.head.rotation.set(
      (avatar.screenPitch || 0) + Math.sin(seconds * 0.78) * 0.020 - pointerY * gaze * 0.050,
      pointerX * gaze * 0.135 + counterSway * 0.014,
      sway * 0.026 - pointerX * gaze * 0.012
    );

    bones.upperArmL.rotation.set(
      breath * 0.012 + strideR * 0.075,
      -0.075 + sway * 0.010 + strideR * 0.18,
      1.385 + breath * 0.022 - gaze * 0.016
    );
    bones.lowerArmL.rotation.set(0, 0, 0.165 + breathLift * 0.016 + gaze * 0.012);
    bones.handL.rotation.set(0, -0.018, -0.055 + sway * 0.014);
    bones.upperArmR.rotation.set(
      -breath * 0.012 + strideL * 0.075,
      0.075 - sway * 0.010 + strideL * 0.18,
      -1.385 - breath * 0.022 + gaze * 0.016
    );
    bones.lowerArmR.rotation.set(0, 0, -0.165 - breathLift * 0.016 - gaze * 0.012);
    bones.handR.rotation.set(0, 0.018, 0.055 - sway * 0.014);

    bones.upperLegL.rotation.set(strideL * 0.24, 0, sway * 0.004);
    bones.lowerLegL.rotation.set(Math.max(0, -strideL) * 0.28, 0, 0);
    bones.footL.rotation.set(-strideL * 0.10 - Math.max(0, -strideL) * 0.16, 0, 0);
    bones.upperLegR.rotation.set(strideR * 0.24, 0, -sway * 0.004);
    bones.lowerLegR.rotation.set(Math.max(0, -strideR) * 0.28, 0, 0);
    bones.footR.rotation.set(-strideR * 0.10 - Math.max(0, -strideR) * 0.16, 0, 0);

    avatar.model.position.y = breath * avatar.reviewedHeight * 0.0018 * (1 - walk * 0.6);
    avatar.model.scale.set(1, 1, 1);
  }
`
