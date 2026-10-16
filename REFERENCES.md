# 技术与视觉参考

本版本的动画、Canvas 绘制、交互和效果代码均为项目内实现。以下项目用于理解原理与评估技术路线，没有将其包、Shader、图像或演示素材复制到运行时代码中。

## OutThisLife / crt-shader

- [仓库与集成说明](https://github.com/OutThisLife/crt-shader)
- [垂直扫描重建](https://github.com/OutThisLife/crt-shader/blob/main/packages/crt-shader/glsl/vertical.glsl)
- [光学处理](https://github.com/OutThisLife/crt-shader/blob/main/packages/crt-shader/glsl/optics.glsl)
- [资源与绘制实现](https://github.com/OutThisLife/crt-shader/blob/main/packages/crt-shader/renderer.js)

源码采用水平、垂直和光学三个阶段，包含亮度相关束宽、栅格、辉光与曝光处理；输出是黑底不透明整帧。该库有原生、Three.js、React 与 pmndrs 适配器，可以作为下一阶段屏幕内容的增强路径，但不能当作透明的全网页滤镜直接覆盖外壳与文字。

本版借鉴扫描、辉光、栅格分离的思路，使用 Canvas 近似。若后续复制或移植原始 GLSL，需保留作者 Brooklyn (OutThisLife) 的 MIT LICENSE 与 NOTICE，并验证颜色空间、方向、Alpha、缓冲精度、动态输入和资源释放。

## unframework / threejs-crt-shader

- [仓库](https://github.com/unframework/threejs-crt-shader)
- [CRTMaterial.tsx](https://github.com/unframework/threejs-crt-shader/blob/master/src/components/CRTMaterial.tsx)

参考球面交点映射、近远扫描线处理、边缘衰减与发光材质。演示依赖旧版 React、React Three Fiber 和 Three.js；本项目保留屏幕映射与材质分工的思路，自行绘制二维外壳和玻璃。原始材质文件头注明 MIT，作者为 Nick Matantsev。

## pmndrs / postprocessing

- [仓库及颜色空间说明](https://github.com/pmndrs/postprocessing)
- [BloomEffect](https://github.com/pmndrs/postprocessing/blob/main/src/effects/BloomEffect.js)
- [GlitchEffect](https://github.com/pmndrs/postprocessing/blob/main/src/effects/GlitchEffect.js)

库依赖 Three.js，适合后续 GPU 管线。研究了阈值辉光、径向色差、分时故障、噪点、暗角和亮度对比处理。本版使用局部、低强度的 Canvas 效果，不创建 EffectComposer。库本身为 Zlib 许可证；后续采用时应保留其声明。

## pixlpa / WebGL Feedback Demo

- [绘制循环](https://github.com/pixlpa/WebGL-Feedback-Demo/blob/master/demo_webgl.js)
- [缓冲封装](https://github.com/pixlpa/WebGL-Feedback-Demo/blob/master/pxslabs.js)

研究双缓冲交替采样，避免将同一纹理同时作为读入与输出。本版本不使用摄像头或历史帧反馈。空间递归每帧由几何重建，以免长期累积采样模糊；后续若加入残影，只作为可关闭的独立效果。

演示的资源分配代码不能直接作为长期运行的生命周期模板：尺寸改变时应复用或释放旧资源，不能不断创建目标。仓库未发现明确的整体许可证，本版仅参考原理。

## CobraFX / Droste.fx

- [原始 ReShade 文件](https://github.com/LordKobra/CobraFX/blob/master/Shaders/Droste.fx)

研究对数空间周期折叠与指数还原。任意纹理的内外边界并不会自动匹配，因此周期折叠本身不等于无缝。本项目采用确定的自相似几何，保持每个绝对层的投影连续；没有移植 ReShade 专用输入、UI 或采样函数。

## HAOQI.DESIGN

- [作者技术案例](https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/)
- [网站](https://haoqi.design/)

采用单帧循环、共享输入快照、DOM 与绘制分工、克制的视觉焦点和有界资源等原则。电视作为唯一主体，界面不复制其作品集布局、彩色玻璃或贴纸。案例研究以作者原文为依据；参考站的截图尝试未成功，不将其描述为已完成的实时视觉审查。

## Retro-futurism 设计语言

- [设计规范](https://designforai.dev/style/retro-futurism)

参考曲线设备轮廓、历史工业形式与复古几何。其暖色原子时代方向与本作不同；本作依据用户指定的 Dark Retrofuturism、Analog Technology 和 Minimalist Experimental Art 设定配色、留白和交互节奏。
