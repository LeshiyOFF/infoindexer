/**
 * Hook для управления фильтрами организаций
 */

"use client";

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FILTERS_PERSIST_KEY,
  SHOW_FILTERS_KEY,
  REVENUE_MAX,
  AGE_MAX,
  SEARCH_DEBOUNCE_MS
} from '@/lib/organizations.constants';
import { parseInitialFilters, getRegionsList, type UrlParams } from './organizations-filters.utils';

export interface RegionOption {
  id: string;
  name: string;
}

function createChangeCallback<T>(
  setValue: (v: T) => void,
  currentPage: T,
  onPageChange: () => void
) {
  return (value: T) => {
    if (value === currentPage) return;
    setValue(value);
    onPageChange();
  };
}

export function useOrganizationsFilters(onPageChange: () => void) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const defaults: UrlParams = useMemo(
    () => ({
      page: 1, search: '', sortBy: 'records_count', sortOrder: 'DESC',
      region: '', okved: '', minRevenue: 0, maxRevenue: REVENUE_MAX,
      minAge: 0, maxAge: AGE_MAX, hasGeo: false, hasDirector: false, hasName: false
    }),
    []
  );

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState(defaults.sortBy);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(defaults.sortOrder);
  const [regionFilter, setRegionFilter] = useState('');
  const [okvedFilter, setOkvedFilter] = useState('');
  const [minRevenue, setMinRevenue] = useState(0);
  const [maxRevenue, setMaxRevenue] = useState<number>(REVENUE_MAX);
  const [minAge, setMinAge] = useState(0);
  const [maxAge, setMaxAge] = useState<number>(AGE_MAX);
  const [hasGeoFilter, setHasGeoFilter] = useState(false);
  const [hasDirectorFilter, setHasDirectorFilter] = useState(false);
  const [hasNameFilter, setHasNameFilter] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hydrationDone, setHydrationDone] = useState(false);

  const syncToUrl = useCallback(
    (updates?: Partial<UrlParams>) => {
      const p = updates?.page ?? 1;
      const s = updates?.search ?? debouncedSearch;
      const sb = updates?.sortBy ?? sortBy;
      const so = updates?.sortOrder ?? sortOrder;
      const r = updates?.region ?? regionFilter;
      const ok = updates?.okved ?? okvedFilter;
      const minR = updates?.minRevenue ?? minRevenue;
      const maxR = updates?.maxRevenue ?? maxRevenue;
      const minA = updates?.minAge ?? minAge;
      const maxA = updates?.maxAge ?? maxAge;
      const hg = updates?.hasGeo ?? hasGeoFilter;
      const hd = updates?.hasDirector ?? hasDirectorFilter;
      const hn = updates?.hasName ?? hasNameFilter;

      const params = new URLSearchParams();
      if (p > 1) params.set('page', p.toString());
      if (s) params.set('search', s);
      if (sb !== 'records_count') params.set('sortBy', sb);
      if (so !== 'DESC') params.set('sortOrder', so);
      if (r) params.set('region', r);
      if (ok) params.set('okved', ok);
      if (minR > 0) params.set('minRevenue', minR.toString());
      if (maxR < REVENUE_MAX) params.set('maxRevenue', maxR.toString());
      if (minA > 0) params.set('minAge', minA.toString());
      if (maxA < AGE_MAX) params.set('maxAge', maxA.toString());
      if (hg) params.set('hasGeo', 'true');
      if (hd) params.set('hasDirector', 'true');
      if (hn) params.set('hasName', 'true');

      const q = params.toString();
      router.replace(q ? `/organizations?${q}` : '/organizations', { scroll: false });

      try {
        sessionStorage.setItem(FILTERS_PERSIST_KEY,
          JSON.stringify({ page: p, search: s, sortBy: sb, sortOrder: so, region: r, okved: ok, minRevenue: minR, maxRevenue: maxR, minAge: minA, maxAge: maxA, hasGeo: hg, hasDirector: hd, hasName: hn })
        );
      } catch { }
    },
    [debouncedSearch, sortBy, sortOrder, regionFilter, okvedFilter, minRevenue, maxRevenue, minAge, maxAge, hasGeoFilter, hasDirectorFilter, hasNameFilter, router]
  );

  useEffect(() => {
    if (hydrationDone) return;
    const init = parseInitialFilters(searchParams);
    setSearch(init.search);
    setDebouncedSearch(init.search);
    setSortBy(init.sortBy);
    setSortOrder(init.sortOrder);
    setRegionFilter(init.region);
    setOkvedFilter(init.okved);
    setMinRevenue(init.minRevenue);
    setMaxRevenue(init.maxRevenue);
    setMinAge(init.minAge);
    setMaxAge(init.maxAge);
    setHasGeoFilter(init.hasGeo);
    setHasDirectorFilter(init.hasDirector);
    setHasNameFilter(init.hasName);
    try {
      setShowFilters(sessionStorage.getItem(SHOW_FILTERS_KEY) === 'true');
    } catch { }
    setHydrationDone(true);
  }, [searchParams, hydrationDone]);

  useEffect(() => {
    if (!hydrationDone) return;
    syncToUrl();
  }, [hydrationDone, debouncedSearch, sortBy, sortOrder, regionFilter, okvedFilter, minRevenue, maxRevenue, minAge, maxAge, hasGeoFilter, hasDirectorFilter, hasNameFilter, syncToUrl]);

  useEffect(() => {
    try { sessionStorage.setItem(SHOW_FILTERS_KEY, showFilters ? 'true' : 'false'); } catch { }
  }, [showFilters]);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(search); onPageChange(); }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [search, onPageChange]);

  const regionsList = useMemo(() => getRegionsList(), []);

  const applyPreset = useCallback(
    (type: string) => {
      if (type === 'real_companies') {
        const alreadyMatch = minRevenue === 200 && maxRevenue === REVENUE_MAX && minAge === 1 && maxAge === AGE_MAX && hasDirectorFilter && !hasGeoFilter;
        if (alreadyMatch) return;
        setMinRevenue(200); setMaxRevenue(REVENUE_MAX); setMinAge(1); setMaxAge(AGE_MAX);
        setHasDirectorFilter(true); setHasGeoFilter(false);
      } else if (type === 'new_ones') {
        const alreadyMatch = minRevenue === 0 && maxRevenue === REVENUE_MAX && minAge === 0 && maxAge === AGE_MAX && !hasDirectorFilter && !hasGeoFilter;
        if (alreadyMatch) return;
        setMinRevenue(0); setMaxRevenue(REVENUE_MAX); setMinAge(0); setMaxAge(AGE_MAX);
        setHasDirectorFilter(false); setHasGeoFilter(false);
      }
      onPageChange();
    },
    [minRevenue, maxRevenue, minAge, maxAge, hasDirectorFilter, hasGeoFilter, onPageChange]
  );

  const resetFilters = useCallback(() => {
    const hasActive = regionFilter || okvedFilter || hasGeoFilter || hasDirectorFilter || hasNameFilter || minRevenue > 0 || maxRevenue < REVENUE_MAX || minAge > 0 || maxAge < AGE_MAX;
    if (!hasActive) return;
    setRegionFilter(''); setOkvedFilter(''); setMinRevenue(0); setMaxRevenue(REVENUE_MAX);
    setMinAge(0); setMaxAge(AGE_MAX); setHasGeoFilter(false); setHasDirectorFilter(false); setHasNameFilter(false);
    onPageChange();
  }, [regionFilter, okvedFilter, hasGeoFilter, hasDirectorFilter, hasNameFilter, minRevenue, maxRevenue, minAge, maxAge, onPageChange]);

  const hasActiveFilters = useMemo(
    () => Boolean(regionFilter || okvedFilter || hasGeoFilter || hasDirectorFilter || hasNameFilter || minRevenue > 0 || maxRevenue < REVENUE_MAX || minAge > 0 || maxAge < AGE_MAX),
    [regionFilter, okvedFilter, hasGeoFilter, hasDirectorFilter, hasNameFilter, minRevenue, maxRevenue, minAge, maxAge]
  );

  const setRegionFilterWithLoad = useMemo(() => createChangeCallback(setRegionFilter, regionFilter, onPageChange), [regionFilter, onPageChange]);
  const setOkvedFilterWithLoad = useMemo(() => createChangeCallback(setOkvedFilter, okvedFilter, onPageChange), [okvedFilter, onPageChange]);
  const setHasGeoWithLoad = useMemo(() => createChangeCallback(setHasGeoFilter, hasGeoFilter, onPageChange), [hasGeoFilter, onPageChange]);
  const setHasDirectorWithLoad = useMemo(() => createChangeCallback(setHasDirectorFilter, hasDirectorFilter, onPageChange), [hasDirectorFilter, onPageChange]);
  const setHasNameWithLoad = useMemo(() => createChangeCallback(setHasNameFilter, hasNameFilter, onPageChange), [hasNameFilter, onPageChange]);

  const setRevenueRange = useCallback(([lo, hi]: [number, number]) => { setMinRevenue(lo); setMaxRevenue(hi); onPageChange(); }, [onPageChange]);
  const setAgeRange = useCallback(([lo, hi]: [number, number]) => { setMinAge(lo); setMaxAge(hi); onPageChange(); }, [onPageChange]);

  return {
    search, debouncedSearch, sortBy, sortOrder, regionFilter, okvedFilter, minRevenue, maxRevenue, minAge, maxAge,
    hasGeoFilter, hasDirectorFilter, hasNameFilter, showFilters, regionsList, hasActiveFilters,
    setSearch, setSortBy, setSortOrder, setRegionFilter: setRegionFilterWithLoad, setOkvedFilter: setOkvedFilterWithLoad,
    setRevenueRange, setAgeRange, setHasGeoFilter: setHasGeoWithLoad, setHasDirectorFilter: setHasDirectorWithLoad,
    setHasNameFilter: setHasNameWithLoad, toggleShowFilters: () => setShowFilters(v => !v), applyPreset, resetFilters
  };
}
