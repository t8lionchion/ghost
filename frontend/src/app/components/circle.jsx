"use client"
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';
import { GoogleMapsContext, latLngEquals } from '@vis.gl/react-google-maps';

function useCircle(props) {
  const {
    onClick, onDrag, onDragStart, onDragEnd,
    onMouseOver, onMouseOut,
    onRadiusChanged, onCenterChanged,
    radius, center,
    ...options
  } = props;

  const callbacks = useRef({}).current;
  Object.assign(callbacks, {
    onClick, onDrag, onDragStart, onDragEnd,
    onMouseOver, onMouseOut,
    onRadiusChanged, onCenterChanged
  });

  const circle = useRef(new google.maps.Circle()).current;
  circle.setOptions(options);

  useEffect(() => {
    if (center && !latLngEquals(center, circle.getCenter())) {
      circle.setCenter(center);
    }
  }, [center]);

  useEffect(() => {
    if (radius != null && radius !== circle.getRadius()) {
      circle.setRadius(radius);
    }
  }, [radius]);

  const map = useContext(GoogleMapsContext)?.map;
  useEffect(() => {
    if (!map) {
      map === undefined &&
        console.error('<Circle> 必須放在 <Map> 裡面使用。');
      return;
    }
    circle.setMap(map);
    return () => circle.setMap(null);
  }, [map]);

  useEffect(() => {
    const gme = google.maps.event;
    const events = [
      ['click', 'onClick'], ['drag', 'onDrag'],
      ['dragstart', 'onDragStart'], ['dragend', 'onDragEnd'],
      ['mouseover', 'onMouseOver'], ['mouseout', 'onMouseOut']
    ];
    events.forEach(([evt, cb]) =>
      gme.addListener(circle, evt, e => callbacks[cb]?.(e))
    );
    gme.addListener(circle, 'radius_changed',
      () => callbacks.onRadiusChanged?.(circle.getRadius()));
    gme.addListener(circle, 'center_changed',
      () => callbacks.onCenterChanged?.(circle.getCenter()));

    return () => gme.clearInstanceListeners(circle);
  }, [circle]);

  return circle;
}

export const Circle = forwardRef((props, ref) => {
  const circle = useCircle(props);
  useImperativeHandle(ref, () => circle);
  return null;
});
