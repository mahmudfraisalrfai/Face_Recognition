// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";

// function App() {
//   const videoRef = useRef(null); // مرجع للفيديو
//   const canvasRef = useRef(null); // مرجع للكانفاس
//   const [modelsLoaded, setModelsLoaded] = useState(false); // حالة تحميل النماذج

//   // تحميل نماذج face-api.js
//   const loadModels = async () => {
//     const MODEL_URL = "/models";
//     await Promise.all([
//       faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
//       faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
//       faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
//       faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
//     ]);
//     setModelsLoaded(true);
//   };

//   // تحميل صور الأشخاص المعروفين وتحويلها إلى descriptors
//   const loadLabeledImages = async () => {
//     const labels = ["mohammed", "ali"]; // أسماء الصور داخل مجلد known_faces
//     return Promise.all(
//       labels.map(async (label) => {
//         const imgUrl = `/known_faces/${label}.jpg`;
//         const img = await faceapi.fetchImage(imgUrl);
//         const detection = await faceapi
//           .detectSingleFace(img)
//           .withFaceLandmarks()
//           .withFaceDescriptor();

//         if (!detection) return null;

//         return new faceapi.LabeledFaceDescriptors(label, [
//           detection.descriptor,
//         ]);
//       })
//     ).then((data) => data.filter(Boolean)); // إزالة null في حال لم يتم التعرف على الوجه
//   };

//   // تشغيل الكاميرا
//   const startVideo = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     if (videoRef.current) {
//       videoRef.current.srcObject = stream;

//       // انتظار تحميل البيانات الوصفية (مثل الأبعاد)
//       await new Promise((resolve) => {
//         videoRef.current.onloadedmetadata = resolve;
//       });

//       videoRef.current.play();
//     }
//   };

//   // عند تشغيل الفيديو والتأكد من أن النماذج جاهزة
//   useEffect(() => {
//     if (!modelsLoaded || !videoRef.current || !canvasRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const context = canvas.getContext("2d");

//     let intervalId;

//     const handlePlay = async () => {
//       const displaySize = {
//         width: video.videoWidth,
//         height: video.videoHeight,
//       };

//       // تعيين أبعاد الكانفاس بنفس أبعاد الفيديو
//       canvas.width = displaySize.width;
//       canvas.height = displaySize.height;

//       // تحميل الوجوه المعروفة
//       const labeledDescriptors = await loadLabeledImages();
//       const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

//       intervalId = setInterval(async () => {
//         // التعرف على جميع الوجوه الموجودة في الفيديو
//         const detections = await faceapi
//           .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
//           .withFaceLandmarks()
//           .withFaceDescriptors();

//         // تغيير حجم النتائج لتناسب الفيديو
//         const resizedDetections = faceapi.resizeResults(
//           detections,
//           displaySize
//         );

//         // مسح الكانفاس
//         context.clearRect(0, 0, canvas.width, canvas.height);

//         resizedDetections.forEach((detection) => {
//           const match = faceMatcher.findBestMatch(detection.descriptor);
//           const label =
//             match.label === "unknown" ? "وجه غير معروف" : match.label;
//           const box = detection.detection.box;

//           const color = match.label === "unknown" ? "red" : "green";

//           // رسم مستطيل حول الوجه
//           context.strokeStyle = color;
//           context.lineWidth = 2;
//           context.strokeRect(box.x, box.y, box.width, box.height);

//           // كتابة الاسم
//           context.fillStyle = color;
//           context.font = "16px Arial";
//           context.fillText(label, box.x, box.y - 10);
//         });
//       }, 100);
//     };

//     video.addEventListener("play", handlePlay);

//     return () => {
//       video.removeEventListener("play", handlePlay);
//       clearInterval(intervalId);
//     };
//   }, [modelsLoaded]);

//   // تحميل النماذج وتشغيل الكاميرا عند بداية التشغيل
//   useEffect(() => {
//     loadModels();
//     startVideo();
//   }, []);

//   return (
//     <div style={{ position: "relative", display: "inline-block" }}>
//       <h2 style={{ textAlign: "center" }}>🎥 نظام التعرف على الوجوه</h2>
//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         width="720"
//         height="560"
//         style={{ position: "relative" }}
//       />
//       <canvas
//         ref={canvasRef}
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//         }}
//       />
//     </div>
//   );
// }

// export default App;
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [attendance, setAttendance] = useState(new Set());

  // تحميل نماذج face-api
  const loadModels = async () => {
    const MODEL_URL = "/models";
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    ]);
    console.log("jdjd");
    setModelsLoaded(true);
  };

  // تحميل صور الأشخاص المعروفين
  const loadLabeledImages = async () => {
    const labels = ["mohammed", "ali", "messi"]; // أضف الأسماء هنا
    return Promise.all(
      labels.map(async (label) => {
        const img = await faceapi.fetchImage(`/known_faces/${label}.jpg`);
        console.log("jdjd");

        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (!detection) return null;
        return new faceapi.LabeledFaceDescriptors(label, [
          detection.descriptor,
        ]);
      })
    ).then((data) => data.filter(Boolean));
  };

  // تشغيل الكاميرا
  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = resolve;
      });
      videoRef.current.play();
    }
  };

  useEffect(() => {
    if (!modelsLoaded || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    let intervalId;

    const handlePlay = async () => {
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };

      canvas.width = displaySize.width;
      canvas.height = displaySize.height;

      const labeledDescriptors = await loadLabeledImages();
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

      intervalId = setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        context.clearRect(0, 0, canvas.width, canvas.height);

        resizedDetections.forEach((detection) => {
          const match = faceMatcher.findBestMatch(detection.descriptor);
          const name = match.label === "unknown" ? "غير معروف" : match.label;
          const box = detection.detection.box;
          const color = match.label === "unknown" ? "red" : "green";

          // ✅ تسجيل الحضور
          if (match.label !== "unknown") {
            setAttendance((prev) => new Set(prev).add(match.label));
          }

          // ✅ رسم المربع والاسم
          context.strokeStyle = color;
          context.lineWidth = 2;
          context.strokeRect(box.x, box.y, box.width, box.height);

          context.fillStyle = color;
          context.font = "16px Arial";
          context.fillText(name, box.x, box.y - 5);
        });
      }, 500); // تقليل التكرار لتقليل الضغط
    };

    video.addEventListener("play", handlePlay);

    return () => {
      video.removeEventListener("play", handlePlay);
      clearInterval(intervalId);
    };
  }, [modelsLoaded]);

  useEffect(() => {
    loadModels();
    startVideo();
  }, []);

  return (
    <div style={{ textAlign: "center", position: "relative" }}>
      <h2>🎯 نظام الحضور بالتعرف على الوجوه</h2>

      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="720"
          height="560"
          style={{ position: "relative" }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>✅ الحضور:</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {[...attendance].map((name) => (
            <li key={name} style={{ fontSize: 18, color: "green" }}>
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
