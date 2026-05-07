using UnityEngine;

namespace MRPiano
{
    public class VirtualFingertipInputProvider : MonoBehaviour
    {
        [SerializeField] private PianoInputRouter inputRouter;
        [SerializeField] private Camera inputCamera;
        [SerializeField] private Transform fingertip;
        [SerializeField] private LayerMask keyLayerMask = ~0;
        [SerializeField] private float hoverHeight = 0.18f;
        [SerializeField] private float pressDepthThreshold = 0.08f;

        private string activeKeyId;
        private string hoverKeyId;

        private void Awake()
        {
            inputRouter ??= GetComponent<PianoInputRouter>();
            inputCamera ??= Camera.main;
            EnsureFingertip();
        }

        private void Update()
        {
            UpdateFingertipPosition();

            if (Input.GetKey(KeyCode.Space) || Input.GetMouseButton(0))
            {
                TryPressHoveredKey();
            }
            else
            {
                ReleaseActiveKey();
            }
        }

        private void UpdateFingertipPosition()
        {
            if (inputCamera == null || fingertip == null)
            {
                return;
            }

            Ray ray = inputCamera.ScreenPointToRay(Input.mousePosition);

            if (Physics.Raycast(ray, out RaycastHit hit, 20f, keyLayerMask))
            {
                hoverKeyId = hit.collider.GetComponent<PianoKey>()?.Definition.id;
                float depth = Input.GetKey(KeyCode.Space) || Input.GetMouseButton(0) ? pressDepthThreshold : 0f;
                fingertip.position = hit.point + Vector3.up * (hoverHeight - depth);
                return;
            }

            hoverKeyId = null;
            ReleaseActiveKey();
        }

        private void TryPressHoveredKey()
        {
            if (string.IsNullOrEmpty(hoverKeyId))
            {
                ReleaseActiveKey();
                return;
            }

            if (hoverKeyId == activeKeyId)
            {
                return;
            }

            ReleaseActiveKey();
            activeKeyId = hoverKeyId;
            inputRouter.Press(activeKeyId);
        }

        private void ReleaseActiveKey()
        {
            if (string.IsNullOrEmpty(activeKeyId))
            {
                return;
            }

            inputRouter.Release(activeKeyId);
            activeKeyId = null;
        }

        private void EnsureFingertip()
        {
            if (fingertip != null)
            {
                return;
            }

            GameObject fingertipObject = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            fingertipObject.name = "VirtualFingertip";
            fingertipObject.transform.SetParent(transform, false);
            fingertipObject.transform.localScale = Vector3.one * 0.035f;
            fingertip = fingertipObject.transform;
        }
    }
}
