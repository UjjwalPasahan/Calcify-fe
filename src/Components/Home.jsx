/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState, useCallback } from 'react';
import { ColorSwatch, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Button from './Button.jsx';
import axios from 'axios';
import Draggable from 'react-draggable';
import { SWATCHES } from '../constants.js';

const Home = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FDFFAB');
  const [reset, setReset] = useState(false);
  const [result, setResult] = useState(null);
  const [dictOfVars, setDictOfVars] = useState({});
  const [latexExpression, setLatexExpression] = useState([]);
  const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
  const [isLoading, setIsLoading] = useState(false);
  const [canvasEmpty, setCanvasEmpty] = useState(true);

  // Canvas Setup and MathJax Loading
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - canvas.offsetTop;
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = color;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Reset Handler
  const handleReset = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.background = 'black';
    
    setLatexExpression([]);
    setResult(null);
    setDictOfVars({});
    setLatexPosition({ x: 10, y: 200 });
    setCanvasEmpty(true);
  }, []);

  // Send Drawing to Backend
  const sendData = async () => {
    if (canvasEmpty) {
      notifications.show({
        title: 'Error',
        message: 'Please draw something on the canvas first!',
        color: 'red'
      });
      return;
    }
  
    setIsLoading(true);
    try {
      const canvas = canvasRef.current;
      // Convert canvas to base64 image data
      const imageData = canvas.toDataURL('image/png');
      
      // Prepare variables (if you have any)
      const variables = Object.entries(dictOfVars).map(([key, value]) => `${key}=${value}`).join(',');
  
      const BASE_URL = 'https://calcify-phi.vercel.app/?vercelToolbarCode=oLml73Uskk5-B1P';
  
      let response = await axios.post(`${BASE_URL}/api/calculate`, {
        image: imageData,
        dictOfVars: variables
      });
      if (Array.isArray(response.data)) {
        response.data.forEach(item => {
          if (!item.error) {
            setResult({ expression: item.expr, answer: item.result });
            
            if (item.assign) {
              setDictOfVars(prev => ({ 
                ...prev, 
                [item.expr.split('=')[0].trim()]: item.result 
              }));
            }
          } else {
            notifications.show({
              title: 'Error',
              message: item.error,
              color: 'red'
            });
          }
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Network Error',
        message: 'Unable to process your request. Please try again.',
        color: 'red'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Drawing Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.style.background = '#000';
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
    setCanvasEmpty(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = color;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {isLoading && <LoadingOverlay visible={true} />}
      
      <div className='absolute top-5 left-5 z-50 bg-[#333] p-4 rounded-lg'>
        <div className="flex flex-col space-y-4">
          <Button
            fn={handleReset}
            classes={'px-4 py-2 rounded-xl text-[#444] bg-white'}
            text={'Reset Canvas'}
          />

          <div className="flex space-x-2">
            {SWATCHES.map((swatch) => (
              <ColorSwatch 
                key={swatch} 
                color={swatch} 
                onClick={() => setColor(swatch)} 
                className="cursor-pointer hover:scale-110 transition-transform"
              />
            ))}
          </div>

          <Button
            fn={sendData}
            classes={'px-4 py-2 rounded-xl text-[#444] bg-white'}
            text={'Calculate'}
            disabled={canvasEmpty}
          />
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className='absolute top-0 left-0 w-full h-full z-10 bg-black'
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />

      {latexExpression.map((latex, index) => (
        <Draggable
          key={index}
          defaultPosition={latexPosition}
          onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
        >
          <div className="absolute p-2 bg-black/50 text-white rounded-lg shadow-md z-50">
            <div className="latex-content text-white">{latex.expr}</div>
          </div>
        </Draggable>
      ))}

      {result && (
        <div className="absolute bottom-5 right-5 z-50 bg-[#333] p-4 rounded-lg text-white">
          <p>Expression: {result.expression}</p>
          <p>Result: {result.answer}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
