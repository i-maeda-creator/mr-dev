using System.IO;
using MRPiano;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MRPiano.Editor
{
    public static class MRPianoSceneBuilder
    {
        private const string SceneDirectory = "Assets/MRPiano/Scenes";
        private const string ScenePath = SceneDirectory + "/Main.unity";

        [MenuItem("MR Piano/Create Main Scene")]
        public static void CreateMainScene()
        {
            Directory.CreateDirectory(SceneDirectory);

            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            scene.name = "Main";

            CreateCamera();
            CreateLight();
            CreatePianoRoot();

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log($"Created MR Piano scene at {ScenePath}");
        }

        private static void CreateCamera()
        {
            GameObject cameraObject = new("Main Camera");
            Camera camera = cameraObject.AddComponent<Camera>();
            cameraObject.tag = "MainCamera";
            cameraObject.transform.position = new Vector3(0f, 1.15f, -1.2f);
            cameraObject.transform.rotation = Quaternion.Euler(58f, 0f, 0f);
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.09f, 0.1f, 0.12f);
            camera.nearClipPlane = 0.02f;
            camera.farClipPlane = 20f;
        }

        private static void CreateLight()
        {
            GameObject lightObject = new("Key Light");
            Light light = lightObject.AddComponent<Light>();
            light.type = LightType.Directional;
            light.intensity = 1.3f;
            lightObject.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
        }

        private static void CreatePianoRoot()
        {
            GameObject pianoRoot = new("PianoRoot");
            pianoRoot.transform.position = Vector3.zero;

            PianoLayoutBuilder layoutBuilder = pianoRoot.AddComponent<PianoLayoutBuilder>();
            pianoRoot.AddComponent<PianoSoundEngine>();
            pianoRoot.AddComponent<PianoInputRouter>();
            pianoRoot.AddComponent<KeyboardInputProvider>();
            pianoRoot.AddComponent<VirtualFingertipInputProvider>();

            layoutBuilder.Build();
        }
    }
}
