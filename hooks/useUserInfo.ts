import { apiClient } from "@/api/apiClientInstance";
import { UserInfo } from "@/api/types";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "./useAuthContext";


export function useUserInfo() {
  const { accessToken } = useAuthContext();
  const { data, ...other } = useQuery({ 
    queryKey: ["userData"], 
    queryFn: () => apiClient.makeRequest<UserInfo>("/user_info", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      },
    })
  });

  return {
    data: {
      firstName: (data) ? data.full_name.split(" ")[0] : "", 
      lastName: (data) ? data.full_name.split(" ")[1] : "", 
      email: (data) ? data.email : '',
    },
    ...other
  };

}