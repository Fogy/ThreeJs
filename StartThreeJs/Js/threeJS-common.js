/***********************
**该库始建于 2017-8-23 **
**作者 申超明(Charles) **
************************/
var x3d = {
    Settings: {
        scene: null,
        camera: null,
        renderer: null
    },
    // 屏幕旋转角度
    scenebelta: 0,
    // 当前选中的对象
    selectedObject: null,
    // 绑定事件的对象
    CLICK_EVENT_OBJECT: [],
    // 事件绑定器
    CLICK_EVENT_BINDER: [],
    // 绑定/扩展基础事件
    Init: function () {
        document.addEventListener('touchstart', HELP_FUNC.DOC_MOUSE_DOWN, false);
        THREE.Object3D.prototype.click = function (func) {
            var that = this;
            var exist = false;
            x3d.CLICK_EVENT_BINDER.forEach(function (item) {
                if (that == item) {
                    item[1] = func + "()";
                    exist = true;
                }
            });
            if (!exist) {
                x3d.CLICK_EVENT_BINDER.push([that, func + "()"]);
                x3d.CLICK_EVENT_OBJECT.push(that);
            }
        }
    },
    // 创建舞台基础对象，包括 场景，相机，渲染器
    CreateBasic: function () {
        x3d.Settings.scene = x3d.CreateScene();
        x3d.Settings.camera = x3d.CreateCamera(true);
        x3d.Settings.renderer = x3d.CreateRender();
    },
    // 创建场景
    CreateScene: function () {
        return new THREE.Scene();
    },
    // 创建相机
    CreateCamera: function (isPerpective) {
        if (isPerpective == true) {
            return new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        } else {
            return new THREE.OrthographicCamera(window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, innerHeight / -16, -200, 500);
        }
    },
    // 创建WebGL渲染（默认）
    CreateRender: function () {
        var renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0xEEEEEE);
        renderer.setSize(window.innerWidth, window.innerHeight);
        //renderer.shadowMapEnabled = true; // 属性请在外部定义,该内部定义无效
        return renderer;
    },
    // 创建画布渲染器，需要引用 CanvasRenderer.js
    CreateCanvasRender: function () {
        var canvasRenderer = new THREE.CanvasRenderer();
        canvasRenderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
        canvasRenderer.setSize(window.innerWidth, window.innerHeight);
        return canvasRenderer;
    },
    // 创建参考坐标系
    CreateAxes: function () {
        var axes = new THREE.AxisHelper(100);
        x3d.Settings.scene.add(axes);
    },
    // [摒弃]自动旋转场景,直接在循环中调用
    // 可使用 scene.rotaion.y+=speed; 替代
    RotateSceneByWorldAres: function (speed) {
        x3d.scenebelta += speed;
        var scene = x3d.Settings.scene;
        var camera = x3d.Settings.camera;
        var camera_radius = camera_radius = Math.sqrt(Math.abs(camera.position.x) * Math.abs(camera.position.x) + Math.abs(camera.position.z) * Math.abs(camera.position.z));
        camera.position.x = Math.sin(x3d.scenebelta) * camera_radius;
        camera.position.z = Math.cos(x3d.scenebelta) * camera_radius;
        camera.lookAt(scene.position);
    },
    // 手动旋转场景,在循环中调用 .update(); 自动旋转场景推荐使用:RotateSceneByWorldAres. 参数O:要控制的对象
    RotateSceneByUserForMobile: function (o) {
        THREE.OrbitControls = function (object, domElement) {
            this.object = object;
            this.domElement = (domElement !== undefined) ? domElement : document;
            this.enabled = true;
            this.center = new THREE.Vector3();
            this.userRotate = true;
            this.userRotateSpeed = 1;
            this.autoRotate = false;
            this.allowup = true;// 允许上下旋转
            this.autoRotateSpeed = 2; // 当帧频为60,速度(autoRotateSpeed)为2时,30秒转一圈
            this.minPolarAngle = 0;
            this.maxPolarAngle = Math.PI;
            this.minDistance = 0;
            this.maxDistance = Infinity;
            var scope = this;
            var EPS = 0.000001;
            var PIXELS_PER_ROUND = 1800;
            var rotateStart = new THREE.Vector2();
            var rotateEnd = new THREE.Vector2();
            var rotateDelta = new THREE.Vector2();
            var phiDelta = 0;
            var thetaDelta = 0;
            var scale = 1;
            var lastPosition = new THREE.Vector3();
            var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
            var state = STATE.NONE;
            var changeEvent = { type: "change" };
            this.rotateLeft = function (angle) {
                if (angle === undefined) {
                    angle = getAutoRotationAngle()
                } thetaDelta -= angle
            };
            this.rotateRight = function (angle) {
                if (angle === undefined) {
                    angle = getAutoRotationAngle()
                } thetaDelta += angle
            };
            this.rotateUp = function (angle) {
                if (angle === undefined) {
                    angle = getAutoRotationAngle()
                } phiDelta -= angle
            };
            this.rotateDown = function (angle) {
                if (angle === undefined) {
                    angle = getAutoRotationAngle()
                } phiDelta += angle
            };
            this.update = function () {
                var position = this.object.position;
                var offset = position.clone().sub(this.center);
                var theta = Math.atan2(offset.x, offset.z);
                var phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);
                if (this.autoRotate) {
                    this.rotateLeft(getAutoRotationAngle())
                } theta += thetaDelta;
                phi += phiDelta;
                phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));
                phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));
                var radius = offset.length() * scale;
                radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));
                offset.x = radius * Math.sin(phi) * Math.sin(theta);
                offset.y = radius * Math.cos(phi);
                offset.z = radius * Math.sin(phi) * Math.cos(theta);
                position.copy(this.center).add(offset);
                this.object.lookAt(this.center);
                thetaDelta = 0;
                phiDelta = 0;
                scale = 1;
                if (lastPosition.distanceTo(this.object.position) > 0) {
                    this.dispatchEvent(changeEvent);
                    lastPosition.copy(this.object.position)
                }
            };
            function getAutoRotationAngle() {
                return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed
            }
            function onMouseDown(event) {
                if (scope.enabled === false) {
                    return
                } if (scope.userRotate === false) {
                    return
                } event.preventDefault();
                var touch = event.targetTouches[0];
                rotateStart.set(touch.clientX, touch.clientY);
                document.addEventListener("touchmove", onMouseMove, false);
                document.addEventListener("touchend", onMouseUp, false)
            }
            function onMouseMove(event) {
                if (scope.enabled === false) {
                    return
                } event.preventDefault();
                event = event.targetTouches[0];
                rotateEnd.set(event.clientX, event.clientY);
                rotateDelta.subVectors(rotateEnd, rotateStart);
                scope.rotateLeft(2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed);
                if (scope.allowup == true) {
                    scope.rotateUp(2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed);
                }
                rotateStart.copy(rotateEnd)
            }
            function onMouseUp(event) {
                if (scope.enabled === false) {
                    return
                } if (scope.userRotate === false) {
                    return
                } document.removeEventListener("mousemove", onMouseMove, false);
                document.removeEventListener("mouseup", onMouseUp, false);
                state = STATE.NONE
            } this.domElement.addEventListener("touchstart", onMouseDown, false)
        };
        THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
        return new THREE.OrbitControls(o ? o : x3d.Settings.camera, x3d.Settings.renderer.domElement);
    },
    // 拉近摄像头, movePoint:向该点移动，isfocus:镜头是否聚焦movepoint
    CameraControls: function (movePoint, isfocus) {
        if (movePoint == undefined) {
            movePoint = x3d.Settings.scene.position;
        }
        THREE.CameraControls = function () {
            this.speed = 0.3; // 移动速度
            var p = x3d.Settings.camera.position;
            var vec = new THREE.Vector3(p.x - movePoint.x, p.y - movePoint.y, p.z - movePoint.z);
            this.l = Math.abs(Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)); // 当前相机所在位置的向量长度
            this.minDistance = -1000;
            this.maxDistance = 1000;

            var scope = this;
            var sinx = vec.x / this.l;
            var siny = vec.y / this.l;
            var sinz = vec.z / this.l;
            this.update = function () {
                if (scope.speed == 0) return false;
                if (scope.l < this.minDistance && scope.speed < 0) return false;
                if (scope.l > this.maxDistance && scope.speed > 0) return false;
                scope.l += scope.speed;
                var x = sinx * scope.l + movePoint.x;
                var y = siny * scope.l + movePoint.y;
                var z = sinz * scope.l + movePoint.z;
                x3d.Settings.camera.position.set(x, y, z);
                if (isfocus) {
                    x3d.Settings.camera.lookAt(movePoint);
                }
            }
        }
        THREE.CameraControls.prototype = Object.create(THREE.EventDispatcher.prototype);
        return new THREE.CameraControls();
    },
    // 相对于自身的参考系，x,y,z可以理解为中心点对于自身的偏移量
    SetCenterOfGeometry: function (geom, x, y, z) {
        geom.applyMatrix(new THREE.Matrix4().makeTranslation(x, y, z));
    },
    /*********************************本地存储***********************************/
    // 保存对象到本地存储，o:可以是任意对象，如 geometry,material,mesh 等...
    SaveObjectToLocalstorage: function (key, o) {
        if (!key || !o) {
            console.log("### key & o 不能为空");
            return false;
        }
        var s = o.toJSON();
        localStorage.setItem(key, JSON.stringify(s));
    },
    // 从本地存储读取数据
    GetObjectFromLocalstorage: function (key) {
        var v = localStorage.getItem(key);
        if (!v) {
            console.log("### 没有包含 key:" + key + " 的本地存储数据");
        }
        var jso = JSON.parse(v);
        var loader = new THREE.ObjectLoader();
        var o = loader.parse(jso);
        return o;
    },
    /*******************************外部模型加载**********************************/
    // 加载外部Json（.js文件）模型数据(Three.js内部模型数据),不需要附加库
    LoadModelFromJson: function (url, callback) {
        var folder = url.substring(0, url.lastIndexOf('/') + 1);
        var loader = new THREE.JSONLoader();
        var mesh;
        loader.load(url, function (geometry, mat) {
            mesh = new THREE.Mesh(geometry, mat[0]);
            x3d.Settings.scene.add(mesh);
            callback(mesh);
        }, folder);
    },
    // 从OBJ文件中加载模型数据, 需要 OBJLoader.js
    LoadModelFromOBJ_WithLambertMaterial: function (url, callback) {
        var loader = new THREE.OBJLoader();
        loader.load(url, function (loadedMesh) {
            var material = new THREE.MeshLambertMaterial({ color: 0x5C3A21 });

            // loadedMesh is a group of meshes. For each mesh set the material, and compute the information three.js needs for rendering.
            loadedMesh.children.forEach(function (child) {
                child.material = child.material ? child.material : material;
                child.geometry.computeFaceNormals();
                child.geometry.computeVertexNormals();
            });
            x3d.Settings.scene.add(loadedMesh);
            callback(loadedMesh);
        });
    },
    // 从OBJ和MTL文件中加载模型（含材质）数据，需要 MTLLoader.js 和 OBJMTLLoader.js
    LoadModelFromOBJandMTL: function (objurl, mtlurl, callback) {
        var loader = new THREE.OBJMTLLoader();
        loader.load(objurl, mtlurl, function (object) {
            x3d.Settings.scene.add(object);
            callback(object);
        });
    },
    // 从 DAE(Collada)文件中加载模型，需要 ColladaLoader.js
    LoadModelFromDAE: function (daeurl, callback) {
        var loader = new THREE.ColladaLoader();
        loader.load(daeurl, function (result) {
            var o = result.scene.children[0].children[0].clone();
            scene.add(o);
            callback(o);
        });
    },
    // 从 STL 文件中加载模型，需要 STLLoader.js
    LoadModelFromSTL_WithLambertMaterial: function (stlurl, callback) {
        var loader = new THREE.STLLoader();
        loader.load(stlurl, function (geometry) {
            var mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
            var mesh = new THREE.Mesh(geometry, mat);
            x3d.Settings.scene.add(mesh);
            callback(mesh);
        });
    },
    // 从 CTM 文件中加载模型，需要 CTMLoader.js,CTMWorker.js,ctm.js,lzma.js
    LoadModelFromCTM_WithLambertMaterial: function (ctmurl, callback) {
        var loader = new THREE.CTMLoader();
        loader.load(ctmurl, function (geometry) {
            var mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
            var mesh = new THREE.Mesh(geometry, mat);
            x3d.Settings.scene.add(mesh);
            callback(mesh);
        }, {});
    },
    // 从 VTK 文件中加载模型，需要 VTKLoader.js
    LoadModelFromVTK_WithLambertMaterial: function (vtkurl, callback) {
        var loader = new THREE.VTKLoader();
        loader.load(vtkurl, function (geometry) {
            var mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
            var mesh = new THREE.Mesh(geometry, mat);
            x3d.Settings.scene.add(mesh);
            callback(mesh);
        });
    },
    // 从 PDB 文件中加载 “蛋白质分子结构” 模型，需要 PDBLoader.js
    LoadModelFromPDB: function (pdburl, callback) {
        var loader = new THREE.PDBLoader();
        loader.load(pdburl, function (geometry, geometryBonds) {
            var i = 0;
            var group = new THREE.Object3D();
            geometry.vertices.forEach(function (position) {
                var sphere = new THREE.SphereGeometry(0.2);
                var material = new THREE.MeshPhongMaterial({ color: geometry.colors[i++] });
                var mesh = new THREE.Mesh(sphere, material);
                mesh.position.copy(position);
                group.add(mesh);
            });

            for (var j = 0; j < geometryBonds.vertices.length; j += 2) {
                var path = new THREE.SplineCurve3([geometryBonds.vertices[j], geometryBonds.vertices[j + 1]]);
                var tube = new THREE.TubeGeometry(path, 1, 0.04);
                var material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
                var mesh = new THREE.Mesh(tube, material);
                group.add(mesh);
            }

            x3d.Settings.scene.add(group);
            callback(group);
        });
    },
    // 从 PLY 文件中加载 多边形模型（Polygon),需要 PLYLoader.js
    LoadModelFromPLY: function (plyurl, callback) {
        var loader = new THREE.PLYLoader();
        var group = new THREE.Object3D();
        loader.load(plyurl, function (geometry) {
            var material = new THREE.PointCloudMaterial({
                color: 0xffffff,
                size: 0.4,
                opacity: 0.6,
                transparent: true,
                blending: THREE.AdditiveBlending,
                map: generateSprite()
            });

            group = new THREE.PointCloud(geometry, material);
            group.sortParticles = true;

            x3d.Settings.scene.add(group);
            callback(group);
        });
        function generateSprite() {
            var canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            var context = canvas.getContext('2d');
            var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
            gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
            gradient.addColorStop(1, 'rgba(0,0,0,1)');

            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);

            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        }
    },
    // 从 AWD 文件中加载模型，需要 AWDLoader.js
    LoadModelFromAWD: function (awdurl, callback) {
        var loader = new THREE.AWDLoader();
        loader.load(awdurl, function (model) {
            model.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
                    console.log(child.geometry);
                }
            });
            x3d.Settings.scene.add(model);
            callback(model);
        });
    },
    // 从 Assimp（.json 文件） 中加载模型，需要 AssimpJSONLoader.js
    LoadModelFromAssimp: function (assimpurl, callback) {
        var loader = new THREE.AssimpJSONLoader();
        loader.load(assimpurl, function (model) {
            model.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    // child.material = new THREE.MeshLambertMaterial({color:0xaaaaaa});
                    // console.log(child.geometry);
                }
            });
            x3d.Settings.scene.add(model);
            callback(model);
        });
    },
    // 从 WRL 文件中 中加载模型，需要 VRMLLoader.js
    LoadModelFromWRL: function (wrlurl, callback) {
        var loader = new THREE.VRMLLoader();
        loader.load(wrlurl, function (model) {
            model.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    // child.material = new THREE.MeshLambertMaterial({color:0xaaaaaa});
                    // console.log(child.geometry);
                }
            });
            x3d.Settings.scene.add(model);
            callback(model);
        });
    },
    // 从 babylon 文件中加载整个场景，需要 BabylonLoader.js
    LoadSceneFromBabylon: function (babylonurl, callback) {
        var loader = new THREE.BabylonLoader();
        loader.load(babylonurl, function (loadedScene) {
            loadedScene.children[1].material = new THREE.MeshLambertMaterial();
            callback(loadedScene);
        });
    },
    // 从 babylon 文件中加载模型，需要 BabylonLoader.js
    LoadModelFromBabylon: function (babylonurl, callback) {
        var loader = new THREE.BabylonLoader();
        loader.load(babylonurl, function (loadedScene) {
            var mesh = loadedScene.children[1];
            mesh.material = new THREE.MeshLambertMaterial();
            x3d.Settings.scene.add(mesh);
            callback(mesh);
        });
    }
}
// 扩展
var x3dextension = {
    // 帧频分析 需要 stats.js
    InitState: function (renderEle, fpsORtime) {
        if (fpsORtime == undefined) {
            fpsORtime = 0;
        }

        var stats = new Stats();
        stats.setMode(fpsORtime);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        $(renderEle).append(stats.domElement);
        return stats;
    },
    // 初始化gui
    InitGui: function () {
        return new dat.GUI();
    }
}
var HELP_FUNC = {
    // 鼠标点击，返回对象信息 及 事件处理
    DOC_MOUSE_DOWN: function (event) {
        var touch = event.targetTouches[0];
        var vector = new THREE.Vector3((touch.clientX / window.innerWidth) * 2 - 1, -(touch.clientY / window.innerHeight) * 2 + 1, 0.5);
        vector = vector.unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(x3d.CLICK_EVENT_OBJECT);
        if (intersects.length > 0) {
            var curo = intersects[0].object;
            x3d.CLICK_EVENT_BINDER.forEach(function (o) {
                if (o[0] == curo) {
                    eval(o[1]);
                }
            });
        }
    }
}