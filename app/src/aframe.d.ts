import 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'a-scene': any;
            'a-entity': any;
            'a-assets': any;
            'a-camera': any;
            'a-cursor': any;
            'a-sphere': any;
            'a-plane': any;
            'a-sky': any;
            'a-light': any;
            'a-box': any;
            'a-cylinder': any;
            'a-cone': any;
            'a-text': any;
            'a-curvedimage': any;
            'a-circle': any;
            'a-ring': any;
            'a-torus': any;
            'a-image': any;
            'a-video': any;
            'a-videosphere': any;
            'a-sound': any;
            'a-gltf-model': any;
            'a-asset-item': any;
        }
    }
}
