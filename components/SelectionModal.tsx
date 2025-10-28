"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import SearchBar from '@/components/SearchBar';
import Table from '@/components/Table';
import useDebounce from '@/lib/hooks/useDebounce';

interface SelectionModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  fetchData: (search: string, page: number, limit: number) => Promise<{ data: T[], total: number }>;
  columns: { header: string; accessor: keyof T; render?: (item: T) => React.ReactNode }[];
  title: string;
  searchPlaceholder: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const SelectionModal = <T extends { id: number | string }>({
  isOpen,
  onClose,
  onSelect,
  fetchData,
  columns,
  title,
  searchPlaceholder,
  size,
}: SelectionModalProps<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: fetchedData, total } = await fetchData(debouncedSearch, currentPage, itemsPerPage);
      setData(fetchedData);
      setTotalItems(total);
    } catch (error) {
      console.error(`Error fetching data for ${title}:`, error);
      setData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, debouncedSearch, currentPage, itemsPerPage]);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, isOpen]);

  const handleSelect = (item: T) => {
    onSelect(item);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <div className="flex flex-col gap-4">
        <SearchBar placeholder={searchPlaceholder} onSearchChange={setSearch} />
        <Table
          columns={columns}
          data={data}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          onRowClick={handleSelect}
        />
      </div>
    </Modal>
  );
};

export default SelectionModal;
