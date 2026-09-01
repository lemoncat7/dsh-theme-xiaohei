import { XIAOHEI_AVATAR_MODEL_GLB } from '../generated-avatar-model.js'

export const XIAOHEI_SYLVA_AVATAR_MARKER = 'data-xiaohei-avatar-model'

/**
 * Parse the reviewed, single-mesh GLB inside ThreeUI's own r149 runtime. This
 * keeps one renderer and one pointer pipeline without loading another Three.js
 * copy or relying on a CDN GLTFLoader.
 */
const AVATAR_ADAPTER = `
  /* ${XIAOHEI_SYLVA_AVATAR_MARKER}="true" */
  var xiaoheiAvatarModelSource = ${JSON.stringify(XIAOHEI_AVATAR_MODEL_GLB)};
  var xiaoheiAvatar = null;
  var xiaoheiAvatarLimbs = null;
  var xiaoheiAvatarRay = new THREE.Raycaster();
  var xiaoheiAvatarWorldSphere = new THREE.Sphere();
  var xiaoheiAvatarPoint = new THREE.Vector3();
  var xiaoheiAvatarHover = 0;

  function xiaoheiAvatarDecode(source) {
    var encoded = source.slice(source.indexOf(',') + 1);
    var binary = atob(encoded);
    var bytes = new Uint8Array(binary.length);
    for (var index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function xiaoheiAvatarReadAccessor(bytes, binaryOffset, manifest, accessorIndex) {
    var accessor = manifest.accessors[accessorIndex];
    var bufferView = manifest.bufferViews[accessor.bufferView];
    var itemSizes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
    var byteSizes = { 5121: 1, 5123: 2, 5125: 4, 5126: 4 };
    var itemSize = itemSizes[accessor.type];
    var componentSize = byteSizes[accessor.componentType];
    var stride = bufferView.byteStride || itemSize * componentSize;
    var start = binaryOffset + (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var Output = accessor.componentType === 5126
      ? Float32Array
      : accessor.componentType === 5125
        ? Uint32Array
        : accessor.componentType === 5123
          ? Uint16Array
          : Uint8Array;
    var output = new Output(accessor.count * itemSize);
    function read(offset) {
      if (accessor.componentType === 5126) return view.getFloat32(offset, true);
      if (accessor.componentType === 5125) return view.getUint32(offset, true);
      if (accessor.componentType === 5123) return view.getUint16(offset, true);
      return view.getUint8(offset);
    }
    for (var item = 0; item < accessor.count; item += 1) {
      for (var component = 0; component < itemSize; component += 1) {
        output[item * itemSize + component] = read(start + item * stride + component * componentSize);
      }
    }
    return { array: output, itemSize: itemSize, normalized: !!accessor.normalized };
  }

  function xiaoheiAvatarParseModel(source) {
    var bytes = xiaoheiAvatarDecode(source);
    var header = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2) {
      throw new Error('Xiaohei avatar must be a GLB 2.0 model');
    }
    var jsonLength = header.getUint32(12, true);
    var jsonStart = 20;
    var manifestText = new TextDecoder('utf-8').decode(bytes.subarray(jsonStart, jsonStart + jsonLength));
    var manifest = JSON.parse(manifestText.replace(/\\u0000/g, '').trim());
    var binaryHeader = jsonStart + jsonLength;
    var binaryLength = header.getUint32(binaryHeader, true);
    var binaryOffset = binaryHeader + 8;
    var primitive = manifest.meshes[0].primitives[0];
    var position = xiaoheiAvatarReadAccessor(bytes, binaryOffset, manifest, primitive.attributes.POSITION);
    var normal = xiaoheiAvatarReadAccessor(bytes, binaryOffset, manifest, primitive.attributes.NORMAL);
    var uv = xiaoheiAvatarReadAccessor(bytes, binaryOffset, manifest, primitive.attributes.TEXCOORD_0);
    var indices = xiaoheiAvatarReadAccessor(bytes, binaryOffset, manifest, primitive.indices);
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position.array, position.itemSize, position.normalized));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normal.array, normal.itemSize, normal.normalized));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv.array, uv.itemSize, uv.normalized));
    geometry.setIndex(new THREE.BufferAttribute(indices.array, 1));
    geometry.computeBoundingBox();
    var bounds = geometry.boundingBox;
    var height = Math.max(bounds.max.y - bounds.min.y, 0.0001);
    var centerX = (bounds.min.x + bounds.max.x) * 0.5;
    var centerZ = (bounds.min.z + bounds.max.z) * 0.5;
    var reviewedHeight = 5.15;
    geometry.translate(-centerX, -bounds.min.y, -centerZ);
    geometry.scale(reviewedHeight / height, reviewedHeight / height, reviewedHeight / height);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    var image = manifest.images[manifest.textures[0].source];
    var imageView = manifest.bufferViews[image.bufferView];
    var imageStart = binaryOffset + (imageView.byteOffset || 0);
    var imageEnd = imageStart + imageView.byteLength;
    if (imageEnd > binaryOffset + binaryLength) throw new Error('Xiaohei avatar texture exceeds the GLB buffer');
    return {
      geometry: geometry,
      imageBytes: bytes.slice(imageStart, imageEnd),
      imageType: image.mimeType || 'image/jpeg',
      reviewedHeight: reviewedHeight
    };
  }

  function xiaoheiAvatarBuildModel() {
    var parsed = xiaoheiAvatarParseModel(xiaoheiAvatarModelSource);
    var root = new THREE.Group();
    root.name = 'xiaohei-avatar-hi3d-root';
    var model = new THREE.Group();
    model.name = 'xiaohei-avatar-hi3d-model';
    root.add(model);

    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.FrontSide,
      transparent: false,
      opacity: 1,
      depthTest: true,
      depthWrite: true
    });
    material.toneMapped = false;
    var mesh = new THREE.Mesh(parsed.geometry, material);
    mesh.name = 'xiaohei-avatar-hi3d-web-v1';
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    mesh.visible = false;
    model.add(mesh);

    var textureBlob = new Blob([parsed.imageBytes], { type: parsed.imageType });
    var textureUrl = URL.createObjectURL(textureBlob);
    new THREE.TextureLoader().load(
      textureUrl,
      function (texture) {
        texture.flipY = false;
        texture.encoding = THREE.sRGBEncoding;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        material.map = texture;
        material.needsUpdate = true;
        mesh.visible = true;
        URL.revokeObjectURL(textureUrl);
        document.documentElement.dataset.xiaoheiAvatarTexture = 'embedded-hi3d-uv-v1';
        renderFrame();
      },
      undefined,
      function () {
        URL.revokeObjectURL(textureUrl);
        material.color.set(0xd8d5cb);
        mesh.visible = true;
        document.documentElement.dataset.xiaoheiAvatarTexture = 'neutral-fallback';
        renderFrame();
      }
    );
    return {
      root: root,
      model: model,
      mesh: mesh,
      hitSphere: parsed.geometry.boundingSphere.clone(),
      reviewedHeight: parsed.reviewedHeight
    };
  }

  function xiaoheiAvatarSample(target) {
    if (!xiaoheiAvatarLimbs || !xiaoheiAvatarLimbs[0]) return false;
    var limb = xiaoheiAvatarLimbs[0];
    var t = 0.42;
    target.copy(limb.curve.getPointAt(t));
    var radius = limb.rw(t) + (limb.moss ? limb.moss(t) * 0.78 : 0);
    target.y += radius + 0.02;
    target.z += radius * 0.20;
    return true;
  }

  function xiaoheiAvatarBuild() {
    if (!nearGroup || !xiaoheiAvatarLimbs || xiaoheiAvatar) return;
    var avatar = xiaoheiAvatarBuildModel();
    nearGroup.add(avatar.root);
    xiaoheiAvatar = avatar;
    xiaoheiAvatarSample(xiaoheiAvatarPoint);
    avatar.root.position.copy(xiaoheiAvatarPoint);
    document.documentElement.dataset.xiaoheiAvatarReady = 'true';
    document.documentElement.dataset.xiaoheiAvatarMotion = 'static-hi3d-idle-v1';
    document.documentElement.dataset.xiaoheiAvatarAction = 'idle-3d';
    document.documentElement.dataset.xiaoheiAvatarPose = 'idle';
    renderFrame();
  }

  function xiaoheiAvatarUpdate() {
    if (!xiaoheiAvatar || !camera || !nearGroup) return;
    var now = performance.now();
    xiaoheiAvatarSample(xiaoheiAvatarPoint);
    xiaoheiAvatar.root.position.copy(xiaoheiAvatarPoint);
    var displayHeight = NARROW.matches ? 2.08 : 1.68;
    xiaoheiAvatar.root.scale.setScalar(displayHeight / xiaoheiAvatar.reviewedHeight);

    var hit = false;
    if (ndc.x <= 2 && xiaoheiAvatar.mesh.visible) {
      xiaoheiAvatarRay.setFromCamera(ndc, camera);
      xiaoheiAvatar.mesh.updateWorldMatrix(true, false);
      xiaoheiAvatarWorldSphere
        .copy(xiaoheiAvatar.hitSphere)
        .applyMatrix4(xiaoheiAvatar.mesh.matrixWorld);
      hit = xiaoheiAvatarRay.ray.intersectsSphere(xiaoheiAvatarWorldSphere);
    }
    xiaoheiAvatarHover += ((hit ? 1 : 0) - xiaoheiAvatarHover) * (hit ? 0.10 : 0.055);
    var breath = Math.sin(now * 0.00125);
    var settle = Math.sin(now * 0.00053 + 0.7);
    xiaoheiAvatar.model.position.y = breath * 0.007;
    xiaoheiAvatar.model.rotation.z = settle * 0.006 - xiaoheiAvatarHover * 0.012;
    xiaoheiAvatar.model.rotation.y += (((ndc.x <= 2 ? ndc.x : 0) * 0.035) - xiaoheiAvatar.model.rotation.y) * 0.025;
    document.documentElement.dataset.xiaoheiAvatarHover = xiaoheiAvatarHover > 0.08 ? 'true' : 'false';
  }

  var xiaoheiAvatarOriginalAssembleRoot = assembleRoot;
  assembleRoot = function (limbs, options) {
    var group = xiaoheiAvatarOriginalAssembleRoot(limbs, options);
    if (!xiaoheiAvatarLimbs && options && options.order === 2) xiaoheiAvatarLimbs = limbs;
    return group;
  };

  var xiaoheiAvatarOriginalRenderFrame = renderFrame;
  renderFrame = function () {
    xiaoheiAvatarUpdate();
    xiaoheiAvatarOriginalRenderFrame();
  };

  var xiaoheiAvatarOriginalBuild = build;
  build = function () {
    xiaoheiAvatarOriginalBuild();
    xiaoheiAvatarBuild();
  };
`

/** Inject the native 3D idle model without editing registered ThreeUI files. */
export function injectXiaoheiSylvaAvatarModel(source: string): string {
  if (source.includes(`${XIAOHEI_SYLVA_AVATAR_MARKER}="true"`)) return source
  const runtimeEnd = source.lastIndexOf('\n})();\n</script>')
  if (runtimeEnd < 0) return source
  return `${source.slice(0, runtimeEnd)}${AVATAR_ADAPTER}${source.slice(runtimeEnd)}`
}

/** Prepare the detached iframe so the model exists on its first WebGL boot. */
export function prepareXiaoheiSylvaAvatarFrame(frame: HTMLIFrameElement): boolean {
  const source = frame.getAttribute('srcdoc')
  if (source === null) return false
  const modeledSource = injectXiaoheiSylvaAvatarModel(source)
  if (modeledSource === source && !source.includes(`${XIAOHEI_SYLVA_AVATAR_MARKER}="true"`)) return false
  frame.dataset.xiaoheiAvatarModel = 'true'
  if (modeledSource !== source) frame.setAttribute('srcdoc', modeledSource)
  return true
}
