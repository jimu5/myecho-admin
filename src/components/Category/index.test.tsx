import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import Category from './index';

jest.mock('./create_box', () => () => <div>create box</div>);

jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  const renderNodes = (nodes: any[]): React.ReactNode =>
    nodes.map((node) => (
      <div key={node.key}>
        <span>{node.title}</span>
        {node.children ? renderNodes(node.children) : null}
      </div>
    ));
  return {
    ...actual,
    Tree: ({ treeData }: any) => <div>{renderNodes(treeData || [])}</div>,
  };
});

describe('Category', () => {
  test('builds a tree with uid keys and child categories', async () => {
    const getAllMethod = jest.fn().mockResolvedValue([
      { id: 1, uid: 'root', name: 'Root', father_uid: '' },
      { id: 2, uid: 'child', name: 'Child', father_uid: 'root' },
    ]);
    const createMethod = jest.fn();

    render(<Category getAllMethod={getAllMethod} CreateMethod={createMethod} />);

    expect(await screen.findByText('create box')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Root')).toBeInTheDocument());
    expect(screen.getByText('Child')).toBeInTheDocument();
  });
});
