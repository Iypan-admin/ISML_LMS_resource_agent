from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseSearchProvider(ABC):
    @abstractmethod
    async def search_candidates(
        self,
        keywords: str,
        target_languages: Optional[List[str]] = None,
        target_levels: Optional[List[str]] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Search for candidate learning resource URLs and metadata."""
        pass
