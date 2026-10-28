import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { sanitizeErrorMessage } from "@/src/utils/errorUtils";
import { useScholarshipStore } from "@/src/store";
import {
  CitizenGrantOverviewData,
  fetchCitizenGrantOverview,
} from "../../grant/api/grantApi";
import {
  CitizenGrantReleaseItem,
  fetchCitizenGrantReleases,
} from "../../grant/api/grantReleaseApi";
import {
  getScholarshipProgramDetails,
  ScholarshipProgram,
} from "../../new-applicant/api/ScholarshipProgramApi";
import {
  CitizenRenewalOverviewData,
  fetchCitizenRenewalOverview,
} from "../../renewal/api/renewalApi";
import {
  CitizenOfficialDocumentsData,
  CitizenScholarshipDocumentsData,
  fetchCitizenOfficialDocuments,
  fetchCitizenScholarshipDocuments,
} from "../api/citizenDocumentApi";
import { CitizenDashboardData } from "../api/scholarshipDashboardApi";

export function useScholarshipDetailData() {
  const { dashboardData: storeDashboardData, fetchDashboard } = useScholarshipStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<CitizenDashboardData | null>(storeDashboardData);
  const [programData, setProgramData] = useState<ScholarshipProgram | null>(null);
  const [renewalOverview, setRenewalOverview] = useState<CitizenRenewalOverviewData | null>(null);
  const [documentRecords, setDocumentRecords] = useState<CitizenScholarshipDocumentsData | null>(null);
  const [officialDocuments, setOfficialDocuments] = useState<CitizenOfficialDocumentsData | null>(null);

  // Sync state if store updates
  useEffect(() => {
    if (storeDashboardData) {
      setDashboardData(storeDashboardData);
    }
  }, [storeDashboardData]);

  // Grant Overview & Releases State
  const [grantOverview, setGrantOverview] = useState<CitizenGrantOverviewData | null>(null);
  const [grantOverviewLoading, setGrantOverviewLoading] = useState(true);
  const [grantOverviewError, setGrantOverviewError] = useState<string | null>(null);
  const [grantReleases, setGrantReleases] = useState<CitizenGrantReleaseItem[]>([]);

  const loadGrantOverview = useCallback(async () => {
    try {
      setGrantOverviewError(null);
      setGrantOverviewLoading(true);
      const overview = await fetchCitizenGrantOverview();
      setGrantOverview(overview);
    } catch (err: any) {
      console.warn("[useScholarshipDetailData] grant overview error:", err);
      setGrantOverview(null);
      setGrantOverviewError(
        sanitizeErrorMessage(err?.message, "Unable to load current grant status.")
      );
    } finally {
      setGrantOverviewLoading(false);
    }
  }, []);

  const loadAllData = useCallback(async (force = false) => {
    try {
      setError(null);
      const [dashRes, relsRes] = await Promise.allSettled([
        fetchDashboard(force),
        fetchCitizenGrantReleases(),
      ]);

      const effectiveDashboard =
        dashRes.status === "fulfilled" && dashRes.value
          ? dashRes.value
          : storeDashboardData;

      if (effectiveDashboard) {
        setDashboardData(effectiveDashboard);
        if (effectiveDashboard.scholarship?.program_id) {
          getScholarshipProgramDetails(effectiveDashboard.scholarship.program_id)
            .then((prog) => setProgramData(prog))
            .catch((progErr) =>
              console.warn("[useScholarshipDetailData] program fetch error:", progErr)
            );
        }
      }

      if (relsRes.status === "fulfilled") {
        setGrantReleases(relsRes.value || []);
      }

      loadGrantOverview();

      fetchCitizenRenewalOverview()
        .then((ren) => setRenewalOverview(ren))
        .catch(() => setRenewalOverview(null));

      fetchCitizenScholarshipDocuments()
        .then((docs) => setDocumentRecords(docs))
        .catch((docErr) =>
          console.warn("[useScholarshipDetailData] docs fetch error:", docErr)
        );

      fetchCitizenOfficialDocuments()
        .then((off) => setOfficialDocuments(off))
        .catch((offErr) =>
          console.warn("[useScholarshipDetailData] official docs fetch error:", offErr)
        );
    } catch (err: any) {
      console.error("[useScholarshipDetailData] load error:", err);
      setError(
        sanitizeErrorMessage(err?.message, "Unable to load scholarship details.")
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [fetchDashboard, loadGrantOverview, storeDashboardData]);

  useFocusEffect(
    useCallback(() => {
      loadAllData(false);
    }, [loadAllData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllData(true);
  }, [loadAllData]);

  return {
    isLoading,
    setIsLoading,
    refreshing,
    error,
    dashboardData,
    programData,
    renewalOverview,
    documentRecords,
    officialDocuments,
    grantOverview,
    grantOverviewLoading,
    grantOverviewError,
    grantReleases,
    loadGrantOverview,
    loadAllData,
    onRefresh,
  };
}
