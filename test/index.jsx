import React, { StrictMode, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Simulate, act } from 'react-dom/test-utils';
import { spy } from 'sinon';
import styled from 'styled-components';

import { expect } from 'chai';

import useScrollOnDrag from '../src';

const noop = () => {};

const Container = styled.div`
  display: inline-block;
  width: 1000px;
  height: 250px;
  overflow-x: scroll;
  overflow-y: hidden;
  border: 1px solid #000;
  padding: 0 5px;
  white-space: nowrap;
`;

const Box = styled.div`
  display: inline-block;
  height: 100%;
  margin: 5px 10px;
  width: 250px;
  background-color: #F00;
`;

describe('react-stay-scrolled', () => {
  const TestComponent = (props) => {
    const containerRef = useRef(null);
    const { events } = useScrollOnDrag(containerRef, props);

    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Container ref={containerRef} {...events}>
        {[...Array(30).keys()].map((i) => <Box key={i} />)}
      </Container>
    );
  };

  function render(element, container, cb = noop) {
    act(() => {
      ReactDOM.render((
        <StrictMode>
          {element}
        </StrictMode>
      ), container, cb);
    });
  }

  let root;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    document.body.removeChild(root);
  });

  describe('general', () => {
    it('should scroll 30px to the right', () => {
      render(<TestComponent />, root);

      const container = root.firstChild;

      expect(container.scrollLeft).to.equal(0);

      Simulate.mouseDown(container, {
        clientX: 100,
        clientY: 100,
      });

      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 50,
        clientY: 100,
      }));

      window.dispatchEvent(new MouseEvent('mouseup', {
        clientX: 50,
        clientY: 100,
      }));

      expect(container.scrollLeft).to.equal(50);
    });
  });

  describe('event handlers', () => {
    it('should call onDragStart and onDragEnd appropriately', () => {
      const onDragStart = spy();
      const onDragEnd = spy();

      render(<TestComponent onDragStart={onDragStart} onDragEnd={onDragEnd} />, root);

      const container = root.firstChild;

      Simulate.mouseDown(container, {
        clientX: 100,
        clientY: 100,
      });

      expect(onDragEnd).to.not.have.been.called();
      expect(onDragStart).to.not.have.been.called();

      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 50,
        clientY: 100,
      }));

      expect(onDragEnd).to.not.have.been.called();
      expect(onDragStart).to.have.been.calledOnce();

      window.dispatchEvent(new MouseEvent('mouseup', {
        clientX: 50,
        clientY: 100,
      }));

      expect(onDragStart).to.have.been.calledOnce();
      expect(onDragEnd).to.have.been.calledOnce();
    });

    it('should not call onDragStart or onDragEnd when clicking outside the component', () => {
      const onDragStart = spy();
      const onDragEnd = spy();

      render(<TestComponent onDragStart={onDragStart} onDragEnd={onDragEnd} />, root);

      document.body.dispatchEvent(new MouseEvent('mousedown', {
        clientX: 50,
        clientY: 600,
      }));

      expect(onDragEnd).to.not.have.been.called();
      expect(onDragStart).to.not.have.been.called();

      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 50,
        clientY: 500,
      }));

      expect(onDragEnd).to.not.have.been.called();
      expect(onDragStart).to.not.have.been.called();

      window.dispatchEvent(new MouseEvent('mouseup', {
        clientX: 50,
        clientY: 500,
      }));

      expect(onDragStart).to.not.have.been.called();
      expect(onDragEnd).to.not.have.been.called();
    });
  });
});
