import { useState, useMemo, useCallback } from 'react';
import { Tab } from '../components/Tab';
import { TextInput } from '../components/TextInput';
import { NumberInput } from '../components/NumberInput';
import { ButtonGroup } from '../components/ButtonGroup';
import { Icon } from '../components/Icon';
import './AircraftSelector.css';

// --- Data model types ---

export type AircraftNodeType = 'manufacturer' | 'family' | 'type' | 'engine' | 'layout';

export interface AircraftTreeNode {
  id: string;
  label: string;
  type: AircraftNodeType;
  children?: AircraftTreeNode[];
  isDefault?: boolean;
}

export interface AircraftSource {
  label: string;
  tree: AircraftTreeNode[];
}

export interface AircraftSummary {
  family: string;
  engine: string;
  layout: string;
}

// --- Configuration tab data ---

export interface AircraftWeights {
  weightVariant?: string;
  basic: number;
  mtw: number;
  mtow: number;
  mlw: number;
  mzfw: number;
  mfc: number;
}

export interface AircraftCabin {
  totalSeats: number;
  firstSeats: number;
  businessSeats: number;
  premiumSeats: number;
  ecoSeats: number;
}

export interface AircraftCG {
  centerOfGravity: number;
}

export interface AircraftConfigData {
  weights: AircraftWeights;
  cabin: AircraftCabin;
  cg: AircraftCG;
}

// --- Performance Model tab data ---

export type PerformanceSource = 'FMS' | 'BADA';

export interface AircraftDeteriorationPerPhase {
  taxi: number;
  takeOff: number;
  climb: number;
  cruise: number;
  descent: number;
  holding: number;
  approachAndLanding: number;
}

export interface AircraftPerformanceData {
  source: PerformanceSource;
  model: string;
  globalDeterioration: number;
  deteriorationPerPhase: AircraftDeteriorationPerPhase;
}

// --- Props ---

export interface AircraftSelectorProps {
  sources: AircraftSource[];
  selectedNodeId?: string;
  onSelect?: (nodeId: string, path: AircraftTreeNode[]) => void;
  summary?: AircraftSummary;
  configData?: AircraftConfigData;
  performanceData?: AircraftPerformanceData;
  onSourceChange?: (source: PerformanceSource) => void;
  activeTab?: number;
  onTabChange?: (index: number) => void;
  searchPlaceholder?: string;
  emptyStateText?: string;
  className?: string;
}

// --- Icon mapping by node type ---

const nodeIconMap: Record<AircraftNodeType, string> = {
  manufacturer: 'folder',
  family: 'folder',
  type: 'folder',
  engine: 'AIR_engine',
  layout: 'airline_seat_recline_extra',
};

// --- Helper: filter tree by search query ---

function filterTree(nodes: AircraftTreeNode[], query: string): AircraftTreeNode[] {
  if (!query) return nodes;
  const lowerQuery = query.toLowerCase();

  return nodes.reduce<AircraftTreeNode[]>((acc, node) => {
    const labelMatches = node.label.toLowerCase().includes(lowerQuery);
    const filteredChildren = node.children ? filterTree(node.children, query) : [];

    if (labelMatches || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      });
    }
    return acc;
  }, []);
}

// --- Helper: collect all node IDs in a tree (for expand-all on search) ---

function collectNodeIds(nodes: AircraftTreeNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    if (node.children) {
      ids.push(...collectNodeIds(node.children));
    }
  }
  return ids;
}

// --- Helper: build path from root to target node ---

function findNodePath(
  nodes: AircraftTreeNode[],
  targetId: string,
  currentPath: AircraftTreeNode[] = []
): AircraftTreeNode[] | null {
  for (const node of nodes) {
    const newPath = [...currentPath, node];
    if (node.id === targetId) return newPath;
    if (node.children) {
      const found = findNodePath(node.children, targetId, newPath);
      if (found) return found;
    }
  }
  return null;
}

// --- TreeNode recursive component ---

interface TreeNodeRowProps {
  node: AircraftTreeNode;
  level: number;
  expandedNodes: Set<string>;
  selectedNodeId?: string;
  onToggle: (nodeId: string) => void;
  onSelectNode: (node: AircraftTreeNode) => void;
}

function TreeNodeRow({ node, level, expandedNodes, selectedNodeId, onToggle, onSelectNode }: TreeNodeRowProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isLeaf = !hasChildren;
  const isSelected = node.id === selectedNodeId;

  const handleClick = () => {
    if (hasChildren) {
      onToggle(node.id);
    }
    if (isLeaf) {
      onSelectNode(node);
    }
  };

  const rowClasses = [
    'aircraft-selector__tree-row',
    isSelected && 'aircraft-selector__tree-row--selected',
    isLeaf && 'aircraft-selector__tree-row--leaf',
  ].filter(Boolean).join(' ');

  const labelSuffix = node.isDefault ? ' (Default)' : '';

  return (
    <>
      <div
        className={rowClasses}
        style={{ paddingLeft: level * 20 + 4 }}
        onClick={handleClick}
        role={isLeaf ? 'treeitem' : 'group'}
        aria-selected={isSelected || undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        {hasChildren && (
          <span className={`aircraft-selector__arrow ${isExpanded ? 'aircraft-selector__arrow--expanded' : ''}`}>
            <Icon name="dropdown" size={24} />
          </span>
        )}
        {!hasChildren && <span className="aircraft-selector__arrow-spacer" />}
        <Icon name={nodeIconMap[node.type]} size={20} />
        <span className="aircraft-selector__tree-label">
          {node.label}{labelSuffix}
        </span>
      </div>
      {hasChildren && isExpanded && node.children!.map((child) => (
        <TreeNodeRow
          key={child.id}
          node={child}
          level={level + 1}
          expandedNodes={expandedNodes}
          selectedNodeId={selectedNodeId}
          onToggle={onToggle}
          onSelectNode={onSelectNode}
        />
      ))}
    </>
  );
}

// --- Fixed tab renderers ---

function ConfigurationTab({ data }: { data: AircraftConfigData }) {
  const { weights, cabin, cg } = data;
  return (
    <div className="aircraft-selector__detail-content">
      {/* Weights */}
      <div className="aircraft-selector__section">
        <div className="aircraft-selector__section-header">
          <span className="aircraft-selector__section-title">Weights</span>
          {weights.weightVariant && (
            <span className="aircraft-selector__section-subtitle">
              (Weight Variant: {weights.weightVariant})
            </span>
          )}
        </div>
        <div className="aircraft-selector__fields">
          <NumberInput label="Basic (kg)" value={weights.basic} readOnly showInfo size="S" />
          <NumberInput label="MTW (kg)" value={weights.mtw} readOnly showInfo size="S" />
          <NumberInput label="MTOW (kg)" value={weights.mtow} readOnly showInfo size="S" />
          <NumberInput label="MLW (kg)" value={weights.mlw} readOnly showInfo size="S" />
          <NumberInput label="MZFW (kg)" value={weights.mzfw} readOnly showInfo size="S" />
          <NumberInput label="MFC (L)" value={weights.mfc} readOnly showInfo size="S" />
        </div>
      </div>

      {/* Cabin */}
      <div className="aircraft-selector__section">
        <div className="aircraft-selector__section-header">
          <span className="aircraft-selector__section-title">Cabin</span>
          <span className="aircraft-selector__section-subtitle">
            (Total seat: {cabin.totalSeats})
          </span>
        </div>
        <div className="aircraft-selector__fields">
          <NumberInput label="First Seats" value={cabin.firstSeats} readOnly size="S" />
          <NumberInput label="Business Seats" value={cabin.businessSeats} readOnly size="S" />
          <NumberInput label="Premium Seats" value={cabin.premiumSeats} readOnly size="S" />
          <NumberInput label="Eco Seats" value={cabin.ecoSeats} readOnly size="S" />
        </div>
      </div>

      {/* CG */}
      <div className="aircraft-selector__section">
        <div className="aircraft-selector__section-header">
          <span className="aircraft-selector__section-title">CG</span>
        </div>
        <div className="aircraft-selector__fields">
          <NumberInput label="Center of gravity (%MAC)" value={cg.centerOfGravity} readOnly size="S" />
        </div>
      </div>
    </div>
  );
}

function PerformanceModelTab({
  data,
  onSourceChange,
}: {
  data: AircraftPerformanceData;
  onSourceChange?: (source: PerformanceSource) => void;
}) {
  const { source, model, globalDeterioration, deteriorationPerPhase } = data;

  return (
    <div className="aircraft-selector__detail-content">
      {/* Source */}
      <div className="aircraft-selector__section">
        <div className="aircraft-selector__section-header">
          <span className="aircraft-selector__section-title">Source</span>
        </div>
        <ButtonGroup
          options={[
            { value: 'FMS', label: 'FMS' },
            { value: 'BADA', label: 'BADA' },
          ]}
          value={source}
          onChange={(val) => onSourceChange?.(val as PerformanceSource)}
          size="S"
        />
      </div>

      {/* Model + Global Deterioration */}
      <div className="aircraft-selector__section">
        <div className="aircraft-selector__perf-row">
          <div className="aircraft-selector__perf-model">
            <TextInput
              label="Model"
              value={model}
              readOnly
              size="S"
            />
          </div>
          <div className="aircraft-selector__perf-global">
            <NumberInput
              label="Global Deterioration (%)"
              value={globalDeterioration}
              readOnly
              size="S"
            />
          </div>
        </div>
      </div>

      {/* Deterioration per phase */}
      <div className="aircraft-selector__section">
        <div className="aircraft-selector__section-header">
          <span className="aircraft-selector__section-title">Deterioration per phase</span>
        </div>
        <div className="aircraft-selector__fields aircraft-selector__fields--perf">
          <NumberInput label="Taxi (%)" value={deteriorationPerPhase.taxi} readOnly size="S" />
          <NumberInput label="Take Off (%)" value={deteriorationPerPhase.takeOff} readOnly size="S" />
          <NumberInput label="Climb (%)" value={deteriorationPerPhase.climb} readOnly size="S" />
          <NumberInput label="Cruise (%)" value={deteriorationPerPhase.cruise} readOnly size="S" />
          <NumberInput label="Descent (%)" value={deteriorationPerPhase.descent} readOnly size="S" />
          <NumberInput label="Holding (%)" value={deteriorationPerPhase.holding} readOnly size="S" />
          <NumberInput label="Approach & Landing (%)" value={deteriorationPerPhase.approachAndLanding} readOnly size="S" />
        </div>
      </div>
    </div>
  );
}

// --- Main AircraftSelector component ---

const TAB_LABELS = ['CONFIGURATION', 'PERFORMANCE MODEL'];

export function AircraftSelector({
  sources,
  selectedNodeId,
  onSelect,
  summary,
  configData,
  performanceData,
  onSourceChange,
  activeTab: controlledActiveTab,
  onTabChange,
  searchPlaceholder = 'Search',
  emptyStateText = 'Select an Aircraft',
  className = '',
}: AircraftSelectorProps) {
  const [activeSource, setActiveSource] = useState(0);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [internalActiveTab, setInternalActiveTab] = useState(0);

  const activeTabIndex = controlledActiveTab ?? internalActiveTab;
  const currentTree = sources[activeSource]?.tree ?? [];

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return currentTree;
    return filterTree(currentTree, searchQuery.trim());
  }, [currentTree, searchQuery]);

  const effectiveExpandedNodes = useMemo(() => {
    if (searchQuery.trim()) {
      return new Set(collectNodeIds(filteredTree));
    }
    return expandedNodes;
  }, [searchQuery, filteredTree, expandedNodes]);

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleSelectNode = useCallback((node: AircraftTreeNode) => {
    if (!onSelect) return;
    const path = findNodePath(currentTree, node.id) ?? [node];
    onSelect(node.id, path);
  }, [onSelect, currentTree]);

  const handleTabChange = (index: number) => {
    if (onTabChange) {
      onTabChange(index);
    } else {
      setInternalActiveTab(index);
    }
  };

  const handleSourceTabChange = (index: number) => {
    setActiveSource(index);
    setSearchQuery('');
  };

  const containerClasses = ['aircraft-selector', className].filter(Boolean).join(' ');
  const hasData = summary && (configData || performanceData);

  return (
    <div className={containerClasses}>
      {/* Left Panel */}
      <div className="aircraft-selector__left">
        <div className="aircraft-selector__source-tabs">
          {sources.map((source, i) => (
            <Tab
              key={source.label}
              label={source.label}
              size="S"
              variant="Default"
              status={activeSource === i ? 'Active' : 'Default'}
              onClick={() => handleSourceTabChange(i)}
            />
          ))}
        </div>
        <div className="aircraft-selector__search">
          <TextInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            showLabel={false}
            showLeftIcon
            leftIcon="search"
            size="S"
            showRightIconButton={searchQuery.length > 0}
            rightIconButton="close"
            onRightIconButtonClick={() => setSearchQuery('')}
          />
        </div>
        <div className="aircraft-selector__tree" role="tree">
          {filteredTree.map((node) => (
            <TreeNodeRow
              key={node.id}
              node={node}
              level={0}
              expandedNodes={effectiveExpandedNodes}
              selectedNodeId={selectedNodeId}
              onToggle={handleToggle}
              onSelectNode={handleSelectNode}
            />
          ))}
          {filteredTree.length === 0 && searchQuery.trim() && (
            <div className="aircraft-selector__tree-empty">
              No results found
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="aircraft-selector__right">
        {!hasData ? (
          <div className="aircraft-selector__empty-state">
            <div className="aircraft-selector__empty-badge">
              <span className="aircraft-selector__empty-arrow">&larr;</span>
              <span className="aircraft-selector__empty-text">{emptyStateText}</span>
            </div>
          </div>
        ) : (
          <>
            {/* Summary header */}
            <div className="aircraft-selector__summary">
              <div className="aircraft-selector__summary-item">
                <Icon name="AIR_side" size={24} />
                <span className="aircraft-selector__summary-label">{summary.family}</span>
              </div>
              <div className="aircraft-selector__summary-item">
                <Icon name="AIR_engine" size={20} />
                <span className="aircraft-selector__summary-label">{summary.engine}</span>
              </div>
              <div className="aircraft-selector__summary-item">
                <Icon name="airline_seat_recline_extra" size={20} />
                <span className="aircraft-selector__summary-label">{summary.layout}</span>
              </div>
            </div>

            {/* Detail tabs */}
            <div className="aircraft-selector__detail-tabs">
              {TAB_LABELS.map((label, i) => (
                <Tab
                  key={label}
                  label={label}
                  size="S"
                  variant="Container"
                  status={activeTabIndex === i ? 'Active' : 'Default'}
                  onClick={() => handleTabChange(i)}
                />
              ))}
            </div>

            {/* Tab content */}
            {activeTabIndex === 0 && configData && (
              <ConfigurationTab data={configData} />
            )}
            {activeTabIndex === 1 && performanceData && (
              <PerformanceModelTab data={performanceData} onSourceChange={onSourceChange} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AircraftSelector;
