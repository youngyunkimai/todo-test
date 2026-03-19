"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useKanbanStore } from "@/lib/store";
import { TAGS } from "@/lib/types";

export function SearchFilterBar() {
  const filters = useKanbanStore((s) => s.filters);
  const setSearchKeyword = useKanbanStore((s) => s.setSearchKeyword);
  const setPriorityFilter = useKanbanStore((s) => s.setPriorityFilter);
  const setTagFilter = useKanbanStore((s) => s.setTagFilter);
  const clearAllFilters = useKanbanStore((s) => s.clearAllFilters);

  const hasActiveFilters =
    filters.searchKeyword || filters.priorityFilter || filters.tagFilter.length > 0;

  function handleTagToggle(tag: string) {
    const current = filters.tagFilter;
    if (current.includes(tag as any)) {
      setTagFilter(current.filter((t) => t !== tag));
    } else {
      setTagFilter([...current, tag as any]);
    }
  }

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-col md:flex-row gap-3">
        <InputGroup className="flex-1">
          <InputGroupAddon align="inline-start">
            <IconSearch />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            role="searchbox"
            placeholder="Search by title..."
            value={filters.searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          {filters.searchKeyword && (
            <InputGroupAddon align="inline-end">
              <Button
                variant="ghost"
                size="icon"
                className="size-5"
                onClick={() => setSearchKeyword("")}
                aria-label="Clear search"
              >
                <IconX />
              </Button>
            </InputGroupAddon>
          )}
        </InputGroup>

        <div className="flex gap-2">
          <Select
            value={filters.priorityFilter ?? "all"}
            onValueChange={(v) => setPriorityFilter(v === "all" ? null : (v as any))}
          >
            <SelectTrigger className="min-w-[120px]" aria-label="Priority filter">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <div data-testid="tag-filter" className="flex gap-1 items-center">
            {TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={filters.tagFilter.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                role="button"
                aria-label={tag}
                aria-pressed={filters.tagFilter.includes(tag)}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filters.searchKeyword && (
            <Badge variant="outline">
              Search: &quot;{filters.searchKeyword}&quot;{" "}
              <button onClick={() => setSearchKeyword("")} aria-label="Remove search filter">
                ✕
              </button>
            </Badge>
          )}
          {filters.priorityFilter && (
            <Badge variant="outline">
              Priority: {filters.priorityFilter}{" "}
              <button onClick={() => setPriorityFilter(null)} aria-label="Remove priority filter">
                ✕
              </button>
            </Badge>
          )}
          {filters.tagFilter.map((tag) => (
            <Badge key={tag} variant="outline">
              Tag: {tag}{" "}
              <button
                onClick={() => setTagFilter(filters.tagFilter.filter((t) => t !== tag))}
                aria-label={`Remove ${tag} filter`}
              >
                ✕
              </button>
            </Badge>
          ))}
          <Button variant="link" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
