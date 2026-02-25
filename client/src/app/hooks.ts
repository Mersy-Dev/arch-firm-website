import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
// Use these everywhere instead of plain useDispatch/useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();